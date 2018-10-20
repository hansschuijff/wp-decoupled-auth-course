// Import libraries
import axios from "axios";
import Cookies from "js-cookie";

// Import components
import Notice from "./Notice";
import Posts from "./Posts";
import Editor from "./Editor";

// Import configs
import {
  getEl,
  editorBtn,
  editorFormId,
  editorTitleId,
  editorContentId,
  tokenCookie,
  rest_url,
  editorPostId
} from "../config";

// Setup token for authorized calls
const token = Cookies.get(tokenCookie);

/**
 * Save - Handles saving post content
 *
 * @export
 * @class Save
 */
export default class Save {
  /**
   * post - Saves post content to WordPress
   *
   * @static
   * @param {DOMHTML} event - The event object
   * @returns
   * @memberof Save
   */
  static post(event) {
    // Get the Quill editor
    const editor = Quill.find(getEl(editorContentId));
    // Setup post object to save with updated content
    const post = {
      // Get the post id
      id: editorPostId || null,
      // Get the editor title
      title: getEl(editorTitleId).value,
      // Get the editor content
      content: editor.root.innerHTML,
      // Set the status to publish
      status: "publish"
    };

    // Prevent default even behavior
    event.preventDefault();

    // Quick and dirty validation
    if (!post.title || !post.content) {
      Notice.render("required");
      return;
    }

    // Check if saving new post or updating existing post
    // Based off of having an existing post id
    if (!editorPostId) {
      // Save post
      axios({
        // Setup method
        method: "post",
        // Setup rest url
        url: rest_url + "wp/v2/posts",
        // Setup the post object to send
        data: post,
        //  Setup headers with auth token
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        }
      })
        .then(response => {
          // Add notice post is saved
          Notice.render("saved");
          // Clear the editor
          Editor.clear();
          // Reload the latest posts
          Posts.init();
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      // Update existing post
      axios({
        // Set method to put
        method: "put",
        // set the URL with the current post id
        url: rest_url + "wp/v2/posts/" + editorPostId,
        // Set the post data object to send
        data: post,
        // Set the headers
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        }
      })
        .then(response => {
          // Load a notice post is updated
          Notice.render("updated");
          // Clear the editor
          Editor.clear();
          // Reload the posts
          Posts.init();
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
}