import * as cheerio from "cheerio"
import fastq from "fastq"
import axios from "axios"
import constants from "./constants"

const queue = fastq.promise(worker, constants.WORKER_CONCURRENCY)

async function worker() {
  const targetUrl = constants.KENYA_COUNTIES_URL;
  const pageResponse = await axios.get(targetUrl);
  const $ = cheerio.load(pageResponse.data);
  const keys = Array()
  const result = Array()

  $("table.wikitable").find("tr").each((row, elem) => {
    const nextCountry: {} = {};
    if (row === 0) {
      $(elem).find('th').each((idx, elem) => {
        const key = $(elem).text().trim()
        keys.push(key)
      })
      return
    }
    $(elem).find('th, td').each((idx, elem) => {
      const value = $(elem).text().trim()
      const key = keys[idx]
      nextCountry[key] = value
    })
    result.push(nextCountry)
  })
  return result
}

async function run() {
  let result = await queue.push({})
  console.info(JSON.stringify(result))
}

run().catch(e => {
  console.error(e)
})