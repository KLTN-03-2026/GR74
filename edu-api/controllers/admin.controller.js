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
          label: "OpenAI chatbot",
          status: Boolean(process.env.OPENAI_API_KEY),
          detail: process.env.OPENAI_API_KEY
            ? `Model ${process.env.OPENAI_MODEL || "gpt-4o-mini"} is configured`
            : "OPENAI_API_KEY is missing",
        },
        {
          key: "stripe",
          label: "Premium payment",
          status: Boolean(process.env.STRIPE_SECRET_KEY),
          detail: process.env.STRIPE_SECRET_KEY ? "Stripe checkout can be created" : "STRIPE_SECRET_KEY is missing",
        },
        {
          key: "mail",
          label: "Email workflow",
          status: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
          detail: process.env.EMAIL_USER && process.env.EMAIL_PASS
            ? "Password reset and premium receipts can be mailed"
            : "EMAIL_USER or EMAIL_PASS is missing",
        },
        {
          key: "jwt",
          label: "JWT secrets",
          status: Boolean(process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET),
          detail: process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET
            ? "Access and refresh token secrets are configured"
            : "ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is missing",
        },
        {
          key: "database",
          label: "MongoDB",
          status: Boolean(process.env.MONGODB_URL),
          detail: process.env.MONGODB_URL ? "Primary database URI is configured" : "MONGODB_URL is missing",
        },
        {
          key: "redis",
          label: "Redis scaling",
          status: Boolean(process.env.REDIS_URL),
          detail: process.env.REDIS_URL ? "Session/cache/socket scaling can use Redis" : "REDIS_URL is missing; memory fallback is used",
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
            "JWT authentication and role-based admin access protect privileged screens.",
            "Premium AI is gated by payment/account status before the chat endpoint responds.",
            "Rate limiting, Helmet and CORS configuration reduce common API abuse risks.",
            "Admin moderation can remove unsafe posts and disable accounts.",
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

      const query = {};
      const andConditions = [];
      if (filter === "premium") query.premium = true;
      if (filter === "standard") query.premium = { $ne: true };

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
          .select("content images tags premium likes comments user createdAt updatedAt")
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
};

module.exports = adminCtrl;
