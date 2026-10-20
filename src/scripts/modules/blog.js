import fs from 'fs';

const MYSITE_PATH = "/var/lib/MySite";
const BLOGPOSTS_PATH = MYSITE_PATH + "/BlogPosts-v1_0_0";
const MAX_POST_LIMIT = 10;

// takes a query string
export async function clientrequest_v1(r) {
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

  try {
    if (typeof(post_ids) == "object") {
      for (var i = 0; i < post_ids.length; i++) {
        var postid = post_ids[i];
        const postpath =  `${BLOGPOSTS_PATH}/post_${toString(postid)}.json`;
        const postdata = await fs.promises.readFile(postpath);
        const postjson = JSON.parse(postdata);
        posts.push(postjson);
        if (i > 10) { break; }
      }
    } else {
      var postid = post_ids[i];
      const postpath =  `${BLOGPOSTS_PATH}/post_${toString(postid)}.json`;
      const postdata = await fs.promises.readFile(postpath);
      const postjson = JSON.parse(postdata);
      posts.push(postjson);
    }

    r.return(200, JSON.stringify({
      success: true,
      data: posts,
      type: "postdata"
    }));
  } catch (e) {
    r.log(`Failed to get ${postid} from ${BLOGPOSTS_PATH}`)
    r.return(500, JSON.stringify({
      success: false,
      type: "postdata"
    }));
  };
}
