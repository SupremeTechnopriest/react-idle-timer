export async function getTestCoverage () {
  let count: number

  try {
    const res = await fetch('https://api.codeclimate.com/v1/repos/5b3a8bccfe3e1002590009b7/test_reports?page[size]=1&filter[branch]=master')
    const json = await res.json()
    count = json.data[0].attributes.rating.measure.value
  } catch (error) {
    count = 100
  }

  return {
    count,
    prettyCount: `${count}%`
  }
}
