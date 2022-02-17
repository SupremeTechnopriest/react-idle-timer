import { numberFormatter } from '@utils/numberFormatter'
import config from '@configs/site.config'

export async function getDiscordMembers () {
  let count: number

  try {
    const res = await fetch(
      `https://discord.com/api/v9/invites/${config.discord.invite}?with_counts=true`
    )
    const data = await res.json()
    if (!res.ok) {
      count = 1_000
    } else {
      count = data.approximate_member_count
    }
  } catch {
    count = 1_000
  }

  return {
    count,
    prettyCount: numberFormatter.format(count)
  }
}
