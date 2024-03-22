const serverless = require("serverless-http");
const express = require("express");
const app = express();
const aws = require("aws-sdk");
const AWS_REGION = "us-east-2";
const ssm = new aws.SSM({ region: AWS_REGION });
const DATABASE_URL_SSM = "";
const { neon, neonConfig } = require("@neondatabase/serverless");

// database connection
async function dbClient() {
  const paramsStore = await ssm
    .getParameter({
      Name: DATABASE_URL_SSM,
      WithDecryption: true,
    })
    .promise();

  neonConfig.fetchConnectionCache = true;
  // const sql = neon(
  //   "postgresql://dassudip.info:P4mB6tbHAgNy@ep-dry-cherry-a5s8ch2d.us-east-2.aws.neon.tech/test?sslmode=require"
  // );
  const sql = neon(paramsStore.Parameter.Value);
  return sql;
}

app.get("/", async (req, res, next) => {
  const db = await dbClient();
  const reshut = await db`select now()`;
  return res.status(200).json({
    message: "Hello from root!",
    reshut: reshut,
  });
});

app.get("/path", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });

module.exports.handler = serverless(app);
