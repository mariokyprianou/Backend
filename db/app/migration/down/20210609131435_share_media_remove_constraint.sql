-- clean up any duplicated 
ALTER TABLE share_media_image ADD CONSTRAINT uq_share_media_image_programme_type UNIQUE (training_programme_id, type)