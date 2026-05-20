const Users = require("../models/user.model");
const Posts = require("../models/post.model");
const Comments = require("../models/comment.model");
const Messages = require("../models/message.model");
const Conversations = require("../models/conversation.model");
const Notifies = require("../models/notify.model");
const PostReports = require("../models/postReport.model");
const { delByPattern } = require("../utils/redisClient");

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const percent = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);
const imageMediaQuery = {
  $or: [
    { "images.url": /\/image\/upload\/|\/video\/upload\/|\.(jpg|jpeg|png|gif|webp|bmp|mp4|mov|webm|avi)(\?|#|$)/i },
    { images: /\/image\/upload\/|\/video\/upload\/|\.(jpg|jpeg|png|gif|webp|bmp|mp4|mov|webm|avi)(\?|#|$)/i },
    { "images.name": /^photo-/i },
  ],
};
const documentMediaQuery = {
  $or: [
    { "images.url": /\/raw\/upload\/|\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)(\?|#|$)/i },
    { "images.name": /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i },
    { "images.fileType": /pdf|docx?|xlsx?|pptx?|txt|raw/i },
    { images: /\/raw\/upload\/|\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)(\?|#|$)/i },
  ],
};

const buildDailySeries = async (Model, days = 7) => {
  const today = startOfDay(new Date());
  const from = new Date(today);
  from.setDate(today.getDate() - (days - 1));

  const rows = await Model.aggregate([
    { $match: { createdAt: { $gte: from } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const countsByDate = rows.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(from);
    date.setDate(from.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    return {
      date: key,
      count: countsByDate[key] || 0,
    };
  });
};

const adminCtrl = {
  getDashboard: async (req, res) => {
    try {
      const paidPaymentQuery = { "premiumPayment.status": "paid" };

      const [
        totalUsers,
        activeUsers,
        adminUsers,
        premiumUsers,
        paidUsers,
        totalPosts,
        premiumPosts,
        totalComments,
        aiComments,
        totalMessages,
        totalConversations,
        groupConversations,
        totalNotifications,
        unreadNotifications,
        paymentRows,
        usersByDay,
        postsByDay,
        commentsByDay,
        messagesByDay,
        latestUsers,
        latestPosts,
        topPosts,
      ] = await Promise.all([
        Users.countDocuments(),
        Users.countDocuments({ isActive: { $ne: false } }),
        Users.countDocuments({ role: "admin" }),
        Users.countDocuments({ aiEnabled: true }),
        Users.countDocuments(paidPaymentQuery),
        Posts.countDocuments(),
        Posts.countDocuments({ premium: true }),
        Comments.countDocuments(),
        Comments.countDocuments({ isAI: true }),
        Messages.countDocuments(),
        Conversations.countDocuments(),
        Conversations.countDocuments({ isGroup: true }),
        Notifies.countDocuments(),
        Notifies.countDocuments({ isRead: false }),
        Users.aggregate([
          { $match: paidPaymentQuery },
          {
            $group: {
              _id: "$premiumPayment.currency",
              amount: { $sum: "$premiumPayment.amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { amount: -1 } },
        ]),
        buildDailySeries(Users),
        buildDailySeries(Posts),
        buildDailySeries(Comments),
        buildDailySeries(Messages),
        Users.find()
          .select("avatar username fullname email role aiEnabled premiumPayment createdAt")
          .sort("-createdAt")
          .limit(8)
          .lean(),
        Posts.find()
          .select("content images likes comments premium createdAt user")
          .populate("user", "avatar username fullname")
          .sort("-createdAt")
          .limit(8)
          .lean(),
        Posts.aggregate([
          {
            $project: {
              content: 1,
              images: 1,
              user: 1,
              premium: 1,
              createdAt: 1,
              likesCount: { $size: "$likes" },
              commentsCount: { $size: "$comments" },
              engagement: { $add: [{ $size: "$likes" }, { $size: "$comments" }] },
            },
          },
          { $sort: { engagement: -1, createdAt: -1 } },
          { $limit: 8 },
        ]),
      ]);

      await Posts.populate(topPosts, { path: "user", select: "avatar username fullname" });

      const readinessItems = [
        {
          key: "openai",
          label: "Trợ lý AI (OpenAI)",
          status: Boolean(process.env.OPENAI_API_KEY),
          detail: process.env.OPENAI_API_KEY
            ? `Đang dùng mô hình ${process.env.OPENAI_MODEL || "gpt-4o-mini"}`
            : "Thiếu OPENAI_API_KEY trong biến môi trường",
        },
        {
          key: "stripe",
          label: "Thanh toán Premium (Stripe)",
          status: Boolean(process.env.STRIPE_SECRET_KEY),
          detail: process.env.STRIPE_SECRET_KEY
            ? "Stripe đã sẵn sàng tạo phiên thanh toán"
            : "Thiếu STRIPE_SECRET_KEY trong biến môi trường",
        },
        {
          key: "mail",
          label: "Gửi email hệ thống",
          status: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
          detail: process.env.EMAIL_USER && process.env.EMAIL_PASS
            ? "Có thể gửi email đặt lại mật khẩu và hóa đơn Premium"
            : "Thiếu EMAIL_USER hoặc EMAIL_PASS trong biến môi trường",
        },
        {
          key: "jwt",
          label: "Bảo mật JWT",
          status: Boolean(process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET),
          detail: process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET
            ? "Access token và refresh token đã được cấu hình"
            : "Thiếu ACCESS_TOKEN_SECRET hoặc REFRESH_TOKEN_SECRET",
        },
        {
          key: "database",
          label: "Cơ sở dữ liệu MongoDB",
          status: Boolean(process.env.MONGODB_URL),
          detail: process.env.MONGODB_URL
            ? "URI kết nối MongoDB đã được cấu hình"
            : "Thiếu MONGODB_URL trong biến môi trường",
        },
        {
          key: "redis",
          label: "Redis (cache & socket)",
          status: Boolean(process.env.REDIS_URL),
          detail: process.env.REDIS_URL
            ? "Redis sẵn sàng cho cache, phiên đăng nhập và socket"
            : "Thiếu REDIS_URL — đang dùng bộ nhớ tạm thay thế",
        },
      ];

      const readinessScore = percent(
        readinessItems.filter((item) => item.status).length,
        readinessItems.length,
      );

      return res.json({
        totals: {
          users: totalUsers,
          activeUsers,
          inactiveUsers: Math.max(totalUsers - activeUsers, 0),
          admins: adminUsers,
          premiumUsers,
          paidUsers,
          posts: totalPosts,
          premiumPosts,
          comments: totalComments,
          aiComments,
          messages: totalMessages,
          conversations: totalConversations,
          groupConversations,
          notifications: totalNotifications,
          unreadNotifications,
        },
        learning: {
          aiConfigured: Boolean(process.env.OPENAI_API_KEY),
          premiumConversionRate: percent(paidUsers, totalUsers),
          aiAdoptionRate: percent(premiumUsers, totalUsers),
          aiCommentShare: percent(aiComments, totalComments),
          premiumPostShare: percent(premiumPosts, totalPosts),
          groupConversationShare: percent(groupConversations, totalConversations),
          averageMessagesPerConversation: totalConversations
            ? Number((totalMessages / totalConversations).toFixed(1))
            : 0,
          averageCommentsPerPost: totalPosts ? Number((totalComments / totalPosts).toFixed(1)) : 0,
        },
        readiness: {
          score: readinessScore,
          items: readinessItems,
          thesisPoints: [
            "JWT xác thực và phân quyền theo vai trò bảo vệ các màn hình quản trị.",
            "AI Premium được kiểm soát qua trạng thái thanh toán trước khi cho phép chat.",
            "Rate limiting, Helmet và CORS giảm thiểu rủi ro tấn công API phổ biến.",
            "Kiểm duyệt bài viết cho phép admin xóa nội dung không phù hợp và khóa tài khoản.",
          ],
        },
        payments: paymentRows.map((row) => ({
          currency: row._id || "usd",
          amount: row.amount || 0,
          count: row.count,
        })),
        series: {
          users: usersByDay,
          posts: postsByDay,
          comments: commentsByDay,
          messages: messagesByDay,
        },
        latestUsers,
        latestPosts,
        topPosts,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getUsers: async (req, res) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
      const search = (req.query.search || "").trim();
      const query = search
        ? {
            $or: [
              { username: { $regex: search, $options: "i" } },
              { fullname: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        Users.find(query)
          .select("-password")
          .sort("-createdAt")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Users.countDocuments(query),
      ]);

      return res.json({ users, total, result: users.length, page });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getPosts: async (req, res) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 80);
      const search = (req.query.search || "").trim();
      const filter = req.query.filter || "all";
      const mediaType = req.query.mediaType || "all";
      const moderation = req.query.moderation || "pending";

      const query = {};
      const andConditions = [];
      if (filter === "premium") query.premium = true;
      if (filter === "standard") query.premium = { $ne: true };

      if (moderation === "pending") {
        andConditions.push({
          $or: [
            { moderationStatus: "pending" },
            { moderationStatus: { $exists: false } },
            { moderationStatus: null },
          ],
        });
      } else if (moderation === "approved") {
        query.moderationStatus = "approved";
      }

      if (mediaType === "media") andConditions.push(imageMediaQuery);
      if (mediaType === "document") andConditions.push(documentMediaQuery);
      if (mediaType === "none") {
        andConditions.push({
          $or: [
            { images: { $exists: false } },
            { images: { $size: 0 } },
          ],
        });
      }

      if (search) {
        const matchingUsers = await Users.find({
          $or: [
            { username: { $regex: search, $options: "i" } },
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }).select("_id").lean();

        andConditions.push({ $or: [
          { content: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
          { user: { $in: matchingUsers.map((user) => user._id) } },
        ] });
      }

      if (andConditions.length) query.$and = andConditions;

      const [posts, total] = await Promise.all([
        Posts.find(query)
          .select("content images tags premium likes comments user moderationStatus createdAt updatedAt")
          .populate("user", "avatar username fullname email role")
          .sort("-createdAt")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Posts.countDocuments(query),
      ]);

      return res.json({
        posts: posts.map((post) => ({
          ...post,
          likesCount: post.likes?.length || 0,
          commentsCount: post.comments?.length || 0,
        })),
        total,
        result: posts.length,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getReports: async (req, res) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 80);
      const status = req.query.status || "pending";
      const query = status === "all" ? {} : { status };

      const [reports, total] = await Promise.all([
        PostReports.find(query)
          .populate("reporter", "avatar username fullname email")
          .populate("owner", "avatar username fullname email")
          .populate({
            path: "post",
            select: "content images tags premium likes comments user createdAt",
            populate: { path: "user", select: "avatar username fullname email" },
          })
          .sort("-createdAt")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        PostReports.countDocuments(query),
      ]);

      return res.json({
        reports,
        total,
        result: reports.length,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateReport: async (req, res) => {
    try {
      const { status = "reviewed", adminNote = "" } = req.body;
      const report = await PostReports.findByIdAndUpdate(
        req.params.id,
        {
          status,
          adminNote,
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
        { new: true },
      );

      if (!report) return res.status(404).json({ msg: "Báo cáo không tồn tại." });
      return res.json({ msg: "Đã cập nhật trạng thái báo cáo.", report });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deletePost: async (req, res) => {
    try {
      const post = await Posts.findByIdAndDelete(req.params.id).populate("user", "username fullname email");
      if (!post) return res.status(404).json({ msg: "Post does not exist." });

      await Comments.deleteMany({ $or: [{ _id: { $in: post.comments } }, { postId: post._id }] });

      const ownerId = post.user?._id || post.user;
      let notify = null;
      if (ownerId && ownerId.toString() !== req.user._id.toString()) {
        notify = await Notifies.create({
          id: post._id,
          user: req.user._id,
          recipients: [ownerId],
          url: "/",
          text: "thông báo: bài viết của bạn đã bị xóa vì nội dung không phù hợp.",
          content: post.content
            ? `Nội dung bị xóa: ${post.content}`
            : "Bài viết của bạn đã bị gỡ khỏi hệ thống vì nội dung không phù hợp.",
          image: post.images?.[0]?.url || post.images?.[0] || "",
        });
      }

      await delByPattern("feed:*");
      await delByPattern("discover:*");
      await PostReports.updateMany({ post: post._id }, {
        status: "removed",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        adminNote: "Admin đã xóa bài viết sau khi xem xét.",
      });

      return res.json({
        msg: "Đã xóa bài viết và gửi thông báo cho người đăng.",
        post: {
          _id: post._id,
          content: post.content,
          user: post.user,
        },
        notify: notify
          ? {
              ...notify._doc,
              user: {
                _id: req.user._id,
                username: req.user.username,
                avatar: req.user.avatar,
              },
            }
          : null,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const allowed = [
        "fullname",
        "username",
        "email",
        "role",
        "isActive",
        "aiEnabled",
        "aiLearningFocus",
        "mobile",
        "address",
        "story",
        "website",
        "gender",
      ];

      const updates = {};
      allowed.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
      });

      if (Object.prototype.hasOwnProperty.call(updates, "aiEnabled")) {
        updates.aiEnabledAt = updates.aiEnabled ? new Date() : null;
      }

      if (updates.email) updates.email = updates.email.toLowerCase().trim();
      if (updates.username) updates.username = updates.username.toLowerCase().replace(/\s/g, "");

      const user = await Users.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) return res.status(404).json({ msg: "User does not exist." });

      return res.json({ msg: "User updated.", user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getPremiumRequests: async (req, res) => {
    try {
      const users = await Users.find({
        role: "user",
        $or: [
          { "premiumPayment.status": "pending" },
          { "premiumPayment.status": "paid", aiEnabled: false },
        ],
      })
        .select("avatar username fullname email aiEnabled premiumPayment createdAt")
        .sort({ "premiumPayment.updatedAt": -1 })
        .lean();

      return res.json({ users });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  activatePremium: async (req, res) => {
    try {
      const user = await Users.findByIdAndUpdate(
        req.params.id,
        { aiEnabled: true, aiEnabledAt: new Date() },
        { new: true }
      ).select("-password");

      if (!user) return res.status(404).json({ msg: "User not found." });
      return res.json({ msg: `Đã kích hoạt Premium cho ${user.username}.`, user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  approvePost: async (req, res) => {
    try {
      const post = await Posts.findByIdAndUpdate(
        req.params.id,
        { moderationStatus: "approved" },
        { new: true }
      ).populate("user", "username fullname");

      if (!post) return res.status(404).json({ msg: "Post not found." });
      return res.json({ msg: "Bài viết đã được duyệt.", post });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = adminCtrl;
