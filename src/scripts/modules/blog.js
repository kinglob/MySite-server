import fs from 'fs';

export function clientrequest(r) {
  // replace this with a query string api
  r.headersOut["Content-Type"] = "application/json; charset=utf-8";

  if (r.method !== "GET") {
    r.headersOut["Allow"] = "GET";
    r.return(405, JSON.stringify({
        success: false,
        error: "GET method only."
    }));
    return;
  }

  try {
    // read requested blog post indices
    const data = await r.readRequestJSON();
    r.log(`Client requested posts: ${data}`);

    // send blog post data to the client
    var response = {};

    r.return(200, JSON.stringify({
      success: true,
      data: response
    }));
  } catch (e) {
    r.return(400, JSON.stringify({
      success: false,
      error: "Invalid JSON"
    }));
  }
}

// returns a json string of count (int) blog posts
// reads json files under /
function getblogposts(count) {

}