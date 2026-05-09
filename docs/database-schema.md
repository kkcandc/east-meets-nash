# Database Schema Draft

## users

- `id`
- `atxp_account_id`
- `email`
- `display_name`
- `created_at`
- `last_seen_at`

## preferences

- `user_id`
- `zones`
- `beats`
- `reporters`
- `email_frequency`
- `personalization_enabled`

## source_items

- `id`
- `source_name`
- `source_url`
- `source_type`
- `captured_at`
- `zone`
- `beat`
- `raw_text`
- `screenshot_asset_id`
- `confidence`
- `risk`
- `score`
- `status`
- `notes`

## stories

- `id`
- `slug`
- `headline`
- `deck`
- `body`
- `zone`
- `beat`
- `confidence_label`
- `reporter_id`
- `status`
- `published_at`
- `seo_title`
- `seo_description`
- `shareability_score`
- `risk_score`

## story_sources

- `story_id`
- `source_item_id`
- `source_name`
- `source_url`
- `source_note`
- `is_public`

## comments

- `id`
- `story_id`
- `user_id`
- `body`
- `status`
- `created_at`

## reactions

- `id`
- `story_id`
- `user_id`
- `reaction`
- `created_at`

## sponsor_products

- `id`
- `name`
- `price_usd`
- `inventory_limit`
- `deliverables`
- `active`

## sponsor_purchases

- `id`
- `atxp_account_id`
- `product_id`
- `amount_usd`
- `status`
- `creative_asset_id`
- `landing_url`
- `starts_at`
- `ends_at`

## classifieds

- `id`
- `user_id`
- `category`
- `title`
- `body`
- `price_usd`
- `status`
- `published_at`
- `expires_at`

## social_posts

- `id`
- `story_id`
- `platform`
- `copy`
- `asset_id`
- `status`
- `scheduled_at`
- `published_url`

## video_jobs

- `id`
- `story_id`
- `reporter_id`
- `prompt`
- `provider`
- `status`
- `asset_id`
- `cost_usd`

## corrections

- `id`
- `story_id`
- `request_source`
- `body`
- `status`
- `resolved_at`

## takedown_requests

- `id`
- `story_id`
- `requester_contact`
- `reason`
- `status`
- `created_at`
- `resolved_at`
