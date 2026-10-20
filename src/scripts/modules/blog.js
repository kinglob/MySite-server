import fs from 'fs';

const MYSITE_PATH = "/var/lib/MySite";
const BLOGPOSTS_PATH = MYSITE_PATH + "/BlogPosts-v1_0_0";
const MAX_POST_LIMIT = 10;

// takes a query string
export async function clientrequest_v1(r) {
  r.headersOut["Content-Type"] = "application/json; charset=utf-8";

  if (r.method !== "GET") {
      r.headersOut["Allow"] = "GET";
      r.return(405, JSON.stringify({
          success: false,
          error: "GET method only."
      }));
      return;
  }

  // check if init
  var is_init = r.args.isinit;
  if (is_init == '1') {
    try {
      const files = fs.readdirSync(BLOGPOSTS_PATH, { withFileTypes: true });
      var file_ids = [];

      for (const file of files) {
        if (!file.isFile()) return;

        const postname_regex = /^post_(\d+)\.json$/;
        const match = postname_regex.exec(file.name);
        file_ids.push(match[1]);
      }

      r.return(200, JSON.stringify({
        success: true,
        data: file_ids,
        type: "init"
      }));
      return;
    } catch (e) {
      r.return(500, JSON.stringify({
        success: false,
        type: "init"
      }));
      return;
    }
  }

  const raw_ids = r.args.ids
  var post_ids = [];

  if (typeof raw_ids === "string") {
    post_ids = raw_ids.split(",");
  } else if (Array.isArray(raw_ids)) {
    for (const value of raw_ids) {
      post_ids.push(value.split(","));
    }
  } else {
    r.return(400, JSON.stringify({
      success: false,
      error: "Missing post IDs.",
      type: "postdata"
    }));
    return;
  }

  r.log(`Client requested posts: ${post_ids}`);
  
  var posts = []
    if (typeof(post_ids) == "object") {
      var postsrequested = 0
      for (const postid of post_ids) {
        const postpath =  `${BLOGPOSTS_PATH}/post_${toString(postid)}.json`;
        try {
          console.log(`Adding post ${postpath} to payload.`);
          const postdata = await fs.promises.readFile(postpath);
          const postjson = JSON.parse(postdata);
          posts.push(postjson);
          postsrequested++;
          if (postsrequested > 10) break;
        } catch (e) {
          r.error(`Failed to load post ${postid} at ${postpath}: ${e}`);
          r.return(500, JSON.stringify({
            success: false,
            type: "postdata"
          }));
        };
      }
    } else {
      const postid = post_ids;
      const postpath =  `${BLOGPOSTS_PATH}/post_${toString(postid)}.json`;
      try {
        const postdata = await fs.promises.readFile(postpath);
        const postjson = JSON.parse(postdata);
        posts.push(postjson);
      } catch (e) {
        r.error(`Failed to load post ${postid} at ${postpath}: ${e}`);
        r.return(500, JSON.stringify({
          success: false,
          type: "postdata"
        }));
      };
    }

    r.return(200, JSON.stringify({
      success: true,
      data: posts,
      type: "postdata"
    }));
}
