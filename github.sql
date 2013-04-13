SELECT actor, repository_owner, repository_name, repository_language, count(repository_name) AS pushes
WHERE type='PushEvent' 
    AND repository_url IN
        (SELECT repository_url, MAX(repository_watchers) AS most_watchers
        FROM [publicdata:samples.github_timeline]
        GROUP BY repository_url
        HAVING most_watchers > 1000)
    AND PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00')
    AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2013-01-01 00:00:00')
GROUP BY actor, repository_name, repository_language
