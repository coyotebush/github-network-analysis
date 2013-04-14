SELECT actor, repository_owner, repository_name, repository_language, count(repository_name) AS pushes
FROM [githubarchive:github.timeline]
WHERE type='PushEvent' 
  AND repository_url IN
  (SELECT repository_url FROM
    (SELECT repository_url, MAX(repository_watchers)
      FROM [githubarchive:github.timeline]
      GROUP BY repository_url
      HAVING MAX(repository_watchers) > 1000))
  AND PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00')
  AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2013-01-01 00:00:00')
GROUP BY actor, repository_owner, repository_name, repository_language;

-- publicdata:samples.github_timeline - 377 repos, 790 users
-- githubarchive:github.timeline      - 965 repos, 2392 users
