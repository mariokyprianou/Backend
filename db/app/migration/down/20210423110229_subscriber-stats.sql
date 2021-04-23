CREATE OR REPLACE VIEW subscriber_stats AS (
	SELECT trainer_id, training_programme_id, COUNT(*)
	FROM account
		     JOIN user_training_programme ON account.user_training_programme_id = user_training_programme.id
		     JOIN training_programme on user_training_programme.training_programme_id = training_programme.id
	WHERE account.deleted_at IS NULL
	GROUP BY ROLLUP (trainer_id, training_programme_id)
);