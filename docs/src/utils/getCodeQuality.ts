export async function getCodeQuality () {
  let score: string

  try {
    let res = await fetch('https://api.codeclimate.com/v1/repos/5b3a8bccfe3e1002590009b7')
    const repo = await res.json()
    const snapshot = repo.data.relationships.latest_default_branch_snapshot.data.id

    res = await fetch(`https://api.codeclimate.com/v1/repos/5b3a8bccfe3e1002590009b7/snapshots/${snapshot}`)
    const json = await res.json()

    score = json.data[0].attributes.ratings[0].letter
  } catch {
    score = 'A'
  }

  return {
    score
  }
}
