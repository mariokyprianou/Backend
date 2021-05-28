UPDATE exercise_tr SET coaching_tips = ' ' WHERE coaching_tips IS NULL;
ALTER TABLE exercise_tr ALTER coaching_tips SET NOT NULL;

UPDATE workout_exercise_tr SET coaching_tips = ' ' WHERE coaching_tips IS NULL;
ALTER TABLE workout_exercise_tr ALTER coaching_tips SET NOT NULL;
