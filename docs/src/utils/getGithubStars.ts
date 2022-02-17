import { Octokit } from '@octokit/rest'
import { numberFormatter } from '@utils/numberFormatter'

const octokit = new Octokit()

export async function getGithubStars () {
  let count: number

  try {
    const repo = await octokit.repos.get({
      owner: 'SupremeTechnopriest',
      repo: 'react-idle-timer'
    })
    count = repo.data.stargazers_count
  } catch {
    count = 19_700
  }

  return {
    count,
    prettyCount: numberFormatter.format(count)
  }
}
