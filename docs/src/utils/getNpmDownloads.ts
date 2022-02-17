import { numberFormatter } from '@utils/numberFormatter'

export async function getMonthlyNpmDownloads () {
  let count = 817_000

  try {
    const data = await fetch(
      'https://api.npmjs.org/downloads/point/last-month/react-idle-timer'
    ).then((res) => res.json())

    count = data.downloads
  } catch (error) {
    console.log('Failed to get npm downloads: ', error.toString())
  }

  return {
    count,
    prettyCount: numberFormatter.format(count)
  }
}

export async function getTotalNpmDownloads () {
  let count: number

  try {
    const data = await fetch(
      'https://api.npmjs.org/downloads/point/1970-01-01:2038-01-19/react-idle-timer'
    ).then((res) => res.json())

    count = data.downloads
  } catch {
    count = 150_000
  }

  return {
    count,
    prettyCount: numberFormatter.format(count)
  }
}
