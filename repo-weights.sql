SELECT t1.repository AS repository1, t2.repository AS repository2,
    SUM(SQRT(t1.weight * t2.weight)) AS weight
FROM
  (SELECT user, repo_info.repository_url AS repository, SUM(weight) as weight
  FROM

    -- Get repositories with over 1000 stars as of the end of 2012
    (SELECT repo_last_events.repository_url AS repository_url
      FROM

      (SELECT repository_url, MAX(created_at) AS created_at
        FROM [publicdata:samples.github_timeline]
        WHERE PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00')
          AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2013-01-01 00:00:00')
        GROUP EACH BY repository_url) AS repo_last_events

      JOIN EACH

      (SELECT repository_url, repository_watchers, created_at
        FROM [publicdata:samples.github_timeline]) AS repo_watchers
      ON repo_last_events.repository_url = repo_watchers.repository_url
        AND repo_last_events.created_at = repo_watchers.created_at

      WHERE repository_watchers >= 1000
    ) AS repo_info

    JOIN EACH

    (SELECT user, repository_url, weight
      FROM

      -- Pushes
      (SELECT actor AS user, repository_url, COUNT(repository_url) AS weight
        FROM [publicdata:samples.github_timeline]
        WHERE type='PushEvent' 
          AND PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00')
          AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2013-01-01 00:00:00')
        GROUP EACH BY user, repository_url),

      -- Merged pull requests
      (SELECT payload_pull_request_user_login AS user, repository_url,
            COUNT(repository_url) AS weight
        FROM [publicdata:samples.github_timeline]
        WHERE type='PullRequestEvent'
          AND payload_action='closed'
          AND payload_pull_request_merged='true'
          AND PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00')
          AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2013-01-01 00:00:00')
        GROUP EACH BY user, repository_url)
    ) AS events
    ON repo_info.repository_url = events.repository_url

  GROUP EACH BY user, repository) AS t1
  
  JOIN EACH

  (SELECT user, repo_info.repository_url AS repository, SUM(weight) as weight
  FROM

    -- Get repositories with over 1000 stars as of the end of 2012
    (SELECT repo_last_events.repository_url AS repository_url
      FROM

      (SELECT repository_url, MAX(created_at) AS created_at
        FROM [publicdata:samples.github_timeline]
        WHERE PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00')
          AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2013-01-01 00:00:00')
        GROUP EACH BY repository_url) AS repo_last_events

      JOIN EACH

      (SELECT repository_url, repository_watchers, created_at
        FROM [publicdata:samples.github_timeline]) AS repo_watchers
      ON repo_last_events.repository_url = repo_watchers.repository_url
        AND repo_last_events.created_at = repo_watchers.created_at

      WHERE repository_watchers >= 1000
    ) AS repo_info

    JOIN EACH

    (SELECT user, repository_url, weight
      FROM

      -- Pushes
      (SELECT actor AS user, repository_url, COUNT(repository_url) AS weight
        FROM [publicdata:samples.github_timeline]
        WHERE type='PushEvent' 
          AND PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00')
          AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2013-01-01 00:00:00')
        GROUP EACH BY user, repository_url),

      -- Merged pull requests
      (SELECT payload_pull_request_user_login AS user, repository_url,
            COUNT(repository_url) AS weight
        FROM [publicdata:samples.github_timeline]
        WHERE type='PullRequestEvent'
          AND payload_action='closed'
          AND payload_pull_request_merged='true'
          AND PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00')
          AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2013-01-01 00:00:00')
        GROUP EACH BY user, repository_url)
    ) AS events
    ON repo_info.repository_url = events.repository_url

  GROUP EACH BY user, repository) AS t2
  ON t1.user = t2.user

WHERE t1.repository < t2.repository
GROUP EACH BY repository1, repository2;

-- publicdata:samples.github_timeline - 460 repo pairs

-- vim: sw=2 ts=2 sts=2 et
