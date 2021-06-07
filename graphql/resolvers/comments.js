const Post = require("../../models/Post.model");
const { UserInputError } = require("apollo-server");
const { AuthenticationError } = require("apollo-server");
const checkAuth = require("../../utils/check-auth");

const comments = {
  Mutation: {
    async createComment(parent, args, context) {
      const user = checkAuth(context);

      const { postId, body } = args;

      if (!body) {
        throw new UserInputError("Empty comments", {
          errors: {
            body: "Comments body must not empty",
          },
        });
      }

      const targetPost = await Post.findById(postId);

      if (targetPost) {
        targetPost.comments.unshift({
          body,
          userName: user.userName,
          createdAt: new Date().toISOString(),
        });
        await targetPost.save();

        return targetPost;
      } else {
        throw new UserInputError("Post not found");
      }
    },

    async deleteComment(parent, args, context) {
      const { userName } = checkAuth(context);

      const { postId, commentId } = args;

      const targetPost = await Post.findById(postId);
      if (targetPost) {
        const targetComment = targetPost.comments.find(
          (comment) => comment.id === commentId
        );

        if (targetComment) {
          if (
            targetPost.userName === userName ||
            targetComment.userName === userName
          ) {
            targetPost.comments = targetPost.comments.filter(
              (comment) => comment.id !== commentId
            );
            await targetPost.save();

            return targetPost;
          } else {
            throw new AuthenticationError("Action not allowed");
          }
        } else {
          throw new UserInputError("Comment not found");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};

module.exports = comments;
