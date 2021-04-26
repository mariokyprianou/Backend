alter table account
    add allow_email_marketing boolean NOT NULL DEFAULT false,
    add allow_error_reports boolean NOT NULL DEFAULT false,
    add allow_analytics boolean NOT NULL DEFAULT false,
    add allow_notifications boolean NOT NULL DEFAULT false
