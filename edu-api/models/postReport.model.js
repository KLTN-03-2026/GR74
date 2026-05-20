const mongoose = require("mongoose");

const postReportSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "post", required: true, index: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
  reason: {
    type: String,
    required: true,
    enum: ["spam", "off_topic", "abuse", "fake", "copyright", "other"],
    default: "other",
  },
  detail: { type: String, trim: true, maxlength: 500, default: "" },
  status: {
    type: String,
    enum: ["pending", "reviewed", "dismissed", "removed"],
    default: "pending",
    index: true,
  },
  adminNote: { type: String, trim: true, maxlength: 500, default: "" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  reviewedAt: Date,
}, {
  timestamps: true,
});

postReportSchema.index({ post: 1, reporter: 1 }, { unique: true });
postReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("post_report", postReportSchema);
