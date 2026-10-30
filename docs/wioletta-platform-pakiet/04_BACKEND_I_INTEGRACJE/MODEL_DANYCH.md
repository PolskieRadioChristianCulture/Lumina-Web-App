# Minimalny model danych (propozycja)
`authors(id,slug,display_name,bio,verified_links[])`
`series(id,slug,title,status)`
`books(id,series_id,volume_no,title,status,cover_asset,publication_status)`
`chapters(id,book_id,number,slug,title,body_html,body_revision,status,published_at,scheduled_at,seo_title,seo_description)`
`chapter_audio(id,chapter_id,asset_uri,duration_ms,transcript,status)`
`users(id,public_alias,created_at,consents[])`
`identities(user_id,provider,provider_subject)` (unikalność provider+subject; bez haseł Google)
`reading_positions(user_id,chapter_id,paragraph_id,revision,progress,updated_at)`
`favorites(user_id,chapter_id/book_id,created_at)`
`comments(id,chapter_id,user_id,parent_id,body,status,is_spoiler,created_at)`
`reports(id,comment_id,reporter_id,reason,status)`
`subscriptions(id,user_id/email,channel,topic,consent_timestamp,unsubscribed_at)`
`releases(id,chapter_id,scheduled_at,processed_at,result,idempotency_key)`
`support_clicks` jedynie anonimowe zdarzenia analityczne, nie księga wpłat.
`audit_events(actor_id,action,object_id,timestamp,metadata)` metadane z minimalizacją PII.

Szyfrowanie połączeń, migracje, retencja, kontrola dostępu po stronie serwera, indeksy na kluczach i czasie publikacji.
