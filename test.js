const admin = require("firebase-admin")
const serviceAccount = require("./your-key-file.json")
const fs = require('fs-extra')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const delay = (ms) => new Promise((resolve) =>
  setTimeout(resolve, ms)
)
const retryBackoff = async (maxTries, initialDelay, func, ...args) => {
  for (let i = 0; i < maxTries; i++) {
    try {
      return await func(...args)
    } catch (error) {
      console.error(error)
      if (i < maxTries - 1) {
        console.log( `retrying in ${initialDelay * Math.pow(2, i)}ms...`)
        await delay(initialDelay * Math.pow(2, i))
      } else {
        throw error
      }
    }
  }
}

const exec = async () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://brianneisler-test.firebaseio.com"
  })

  // const allRulesets = []
  // let pageToken = undefined
  // while (true) {
  //   const result = await admin.securityRules().listRulesetMetadata(1, pageToken)
  //   console.log(result)
  //   allRulesets.push(...result.rulesets);
  //   pageToken = result.nextPageToken;
  //   if (!pageToken) {
  //     break;
  //   }
  // }

  const source = await fs.readFile(path.resolve(__dirname, 'firestore.rules'))
  const rulesFile = admin.securityRules().createRulesFileFromSource(`${uuidv4()}.rules`, source)
  const ruleset = await retryBackoff(10, 100, async () => {
    await admin.securityRules().createRuleset(rulesFile)
  })
}

exec()
  .catch((error) => {
    console.error(error)
  })
  .finally(() => {
    process.exit()
  })
