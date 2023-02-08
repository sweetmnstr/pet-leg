-- INSERT DATA INTO TABLES

-- INSERT NOTIFICATION FILTERS ITEMS
INSERT
INTO "notificationFilters" ("customerSessionUpdates", "lawyerSessionUpdates", "customerNewMessages", "lawyerNewMessages", "customerSharedLinksUpdates", "lawyerSharedLinksUpdates", "customerGeneralNotifications", "lawyerGeneralNotifications")
VALUES(false, false, false, false, false, true, true, true);

INSERT
INTO "notificationFilters" ("customerSessionUpdates", "lawyerSessionUpdates", "customerNewMessages", "lawyerNewMessages", "customerSharedLinksUpdates", "lawyerSharedLinksUpdates", "customerGeneralNotifications", "lawyerGeneralNotifications")
VALUES(false, false, true, true, false, true, true, true);

INSERT
INTO "notificationFilters" ("customerSessionUpdates", "lawyerSessionUpdates", "customerNewMessages", "lawyerNewMessages", "customerSharedLinksUpdates", "lawyerSharedLinksUpdates", "customerGeneralNotifications", "lawyerGeneralNotifications")
VALUES(false, false, false, false, false, false, false, false);

INSERT
INTO "notificationFilters" ("customerSessionUpdates", "lawyerSessionUpdates", "customerNewMessages", "lawyerNewMessages", "customerSharedLinksUpdates", "lawyerSharedLinksUpdates", "customerGeneralNotifications", "lawyerGeneralNotifications")
VALUES(false, false, false, false, false, false, false, false);

INSERT
INTO "notificationFilters" ("customerSessionUpdates", "lawyerSessionUpdates", "customerNewMessages", "lawyerNewMessages", "customerSharedLinksUpdates", "lawyerSharedLinksUpdates", "customerGeneralNotifications", "lawyerGeneralNotifications")
VALUES(false, false, false, false, false, false, false, false);

INSERT
INTO "notificationFilters" ("customerSessionUpdates", "lawyerSessionUpdates", "customerNewMessages", "lawyerNewMessages", "customerSharedLinksUpdates", "lawyerSharedLinksUpdates", "customerGeneralNotifications", "lawyerGeneralNotifications")
VALUES(false, false, false, false, false, false, false, false);

-- INSERT USER ITEMS
INSERT
INTO "user"("firstName", "lastName", "email", "phone", "password", "roles", "platformLanguage", "timezone", "notificationFiltersId")
VALUES('Lennie', 'Rempel', 'lennie@admin.com', '(659) 403-4766', MD5('oPrvqt9Ut7gjOHv'), 'admin', 'en', 'Europe/Rome', (SELECT "id" FROM "notificationFilters" WHERE "id" = 1));

INSERT 
INTO "user"("firstName", "lastName", "email", "phone", "password", "roles", "platformLanguage", "timezone", "notificationFiltersId")
VALUES('Dimitri' , 'Klein', 'dimitri@admin.com', '(665) 639-4230', MD5('1H7MHY7RAh3hKj0'), 'admin', 'uk', 'Europe/Kiev', (SELECT "id" FROM "notificationFilters" WHERE "id" = 2));

INSERT 
INTO "user"("firstName", "lastName", "email", "phone", "password", "roles", "platformLanguage", "timezone", "notificationFiltersId")
VALUES('Darrion', 'Grimes', 'darrion@lawyer.com', '351-461-5845', MD5('6ogAJMPK7WcVtmt'), 'lawyer', 'en', 'Europe/Kiev', (SELECT "id" FROM "notificationFilters" WHERE "id" = 3));

INSERT 
INTO "user"("firstName", "lastName", "email", "phone", "password", "roles", "platformLanguage", "timezone", "notificationFiltersId")
VALUES('Dariana', 'Goodwin', 'dariana@customer.com', '(659) 403-4766', MD5('lAdsIxRLrpSLRAi'), 'customer', 'en', 'Europe/Copenhagen', (SELECT "id" FROM "notificationFilters" WHERE "id" = 4));

INSERT 
INTO "user"("firstName", "lastName", "email", "phone", "password", "roles", "platformLanguage", "timezone", "notificationFiltersId")
VALUES('Alan', 'Googman', 'alan@customer.com', '(659) 403-0000', MD5('lAdsIxRasqIsqnq'), 'customer', 'en', 'Europe/London', (SELECT "id" FROM "notificationFilters" WHERE "id" = 5));

INSERT 
INTO "user"("firstName", "lastName", "email", "phone", "password", "roles", "platformLanguage", "timezone", "notificationFiltersId")
VALUES('Emily', 'Googman', 'emily@lawyer.com', '(654) 890-0000', MD5('lAdsIxRasqIsqnq'), 'lawyer', 'en', 'Europe/London', (SELECT "id" FROM "notificationFilters" WHERE "id" = 6));

-- INSERT CUSTOMER ITEMS
INSERT 
INTO "customer"("userId", "authType")
VALUES((SELECT "id" FROM "user" WHERE "email" LIKE 'dariana@customer.com'), 'google');

INSERT 
INTO "customer"("userId", "authType")
VALUES((SELECT "id" FROM "user" WHERE "email" LIKE 'alan@customer.com'), 'facebook');

-- INSERT LAWYER ITEMS
INSERT
INTO "lawyer" ("userId", "title", "introVideo", "language", "description", "legal_areas", "education", "workExperience", "experienceTime", "certifications", "country", "city", "specialization", "profileImage")
VALUES((SELECT "id" FROM "user" WHERE "email" LIKE 'darrion@lawyer.com'), 'bla-bla-bla', 'https://', 'en', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...', 'Banking and Debt Finance Law', ARRAY['{"title":"education title"}']::json[], ARRAY['{"title":"work experience title"}']::json[], 1, ARRAY['{"title":"certifications title"}']::json[], 'ukraine', 'kyiv', '{socialWelfarePrograms}', 'https://photo/1');

INSERT
INTO "lawyer" ("userId", "title", "introVideo", "language", "description", "legal_areas", "education", "workExperience", "experienceTime", "certifications", "country", "city", "specialization", "profileImage")
VALUES((SELECT "id" FROM "user" WHERE "email" LIKE 'emily@lawyer.com'), 'bla-bla-bla-2', 'https://toe', 'en', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...', 'Banking and Debt Finance Law', ARRAY['{"title":"education title"}']::json[], ARRAY['{"title":"work experience title"}']::json[], 1, ARRAY['{"title":"certifications title"}']::json[], 'ukraine','kyiv', '{internallyDisplacedPersons}', 'https://photo/2');

-- INSERT FAVORITE ITEMS
INSERT
INTO "favorite" ("lawyerId", "customerId")
VALUES(
    (SELECT "lawyer"."id" FROM "user" INNER JOIN "lawyer" ON "user"."id" = "lawyer"."userId" WHERE "email" LIKE 'darrion@lawyer.com'),
    (SELECT "customer"."id" FROM "user" INNER JOIN "customer" ON "user"."id" = "customer"."userId" WHERE "email" LIKE 'dariana@customer.com')
);

-- INSER LAWYER FILTERS ITEMS
INSERT INTO "lawyers-filter"("filterName", "filterValues")
VALUES('specialization', ARRAY ['internallyDisplacedPersons', 'socialWelfarePrograms', 'pension', 'employmentIssues', 'registrationOfBirth', 'registrationOfDeath', 'diia', 'missingPerson', 'accessToHealthcare', 'accessToEducation', 'familyRelations', 'childrenAndMinors', 'goingAbroad', 'rulesForPetOwners', 'hlp', 'compensationForProperty', 'mortgageAndLoanIssues', 'willsAndInheritance', 'conscription', 'veteransRightsAndGuarantees', 'entrepreneurship', 'regulationOfVolunteerActivities', 'citizenship', 'reefugeesProtection', 'recoveryPersonalDocumentation', 'drivingLicenseAndRegistration']);

INSERT INTO "lawyers-filter"("filterName", "filterValues")
VALUES('country', ARRAY ['ukraine', 'germany', 'poland', 'greece', 'romania', 'moldova', 'italy', 'denmark', 'serbia']);

-- INSERT LAWYER SCHEDULE
INSERT INTO "schedule" ("lawyerId", availability)
VALUES((SELECT "lawyer"."id" FROM "user" INNER JOIN "lawyer" ON "user"."id" = "lawyer"."userId" WHERE "email" LIKE 'darrion@lawyer.com'), {"monday": [],"tuesday": [],"wednesday": [],"thursday": [],"friday": [],"saturday": [{"from": "T11:30:00.000Z", "to":"T14:30:00.000Z"}],"sunday": []});

-- INSERT FAQ
INSERT INTO "faq" ("name")
VALUES('General');

INSERT INTO "faq" ("name")
VALUES('Test');

-- INSERT Questions
INSERT INTO "question" ("categoryId", "question", "answer")
VALUES((SELECT "faq"."id" FROM "faq" WHERE "name" LIKE 'General'), 'first general question', 'first general answer');

INSERT INTO "question" ("categoryId", "question", "answer")
VALUES((SELECT "faq"."id" FROM "faq" WHERE "name" LIKE 'General'), 'second general question', 'second general answer');

INSERT INTO "question" ("categoryId", "question", "answer")
VALUES((SELECT "faq"."id" FROM "faq" WHERE "name" LIKE 'Test'), 'second test question', 'second test answer');

-- INSERT Recomendations ITEMS
INSERT
INTO "recomendations" ("type", "values", "locales")
VALUES('type 1', ARRAY['val1', 'val2'], '{"val1": {"en": "something1", "ua": "шото 2"}, "val2": {"en": "something1", "ua": "шото 2"}}');

INSERT
INTO "recomendations" ("type", "values", "locales")
VALUES('type 2',  ARRAY['val1', 'val2'], '{"val1": {"en": "something1", "ua": "шото 2"}, "val2": {"en": "something1", "ua": "шото 2"}}');

-- INSERT CATEGORIES
INSERT INTO "category"("title", "subtitle")
VALUES('Economics', 'economics');

INSERT INTO "category"("title", "subtitle")
VALUES('Politics', 'politics');

INSERT INTO "category"("title", "subtitle")
VALUES('Society', 'society');

INSERT INTO "category"("title", "subtitle")
VALUES('Jurisprudence', 'jurisprudence');

INSERT INTO "category"("title", "subtitle")
VALUES('Social Welfare Programs', 'social welfare programs');

INSERT INTO "category"("title", "subtitle")
VALUES('War Related Services', 'war related services');

-- INSERT POSTS
INSERT INTO "post" ("title", "content", "categoryId")
VALUES('New post', 'bla bla bla', (SELECT "id" FROM "category" WHERE "title" = 'Economics'));

INSERT INTO "post" ("title", "content", "categoryId")
VALUES('New economic post', 'bla bla bla', (SELECT "id" FROM "category" WHERE "title" = 'Economics'));

INSERT INTO "post" ("title", "content", "categoryId")
VALUES('New politics post', 'bla bla bla', (SELECT "id" FROM "category" WHERE "title" = 'Politics'));

-- INSERT GEOLOCATION ITEMS
INSERT
INTO "geolocation" ("longitude", "latitude", "lawyerId")
VALUES(50.4172391, 30.5771497, (SELECT "lawyer"."id" FROM "user" INNER JOIN "lawyer" ON "user"."id" = "lawyer"."userId" WHERE "email" LIKE 'darrion@lawyer.com'));

INSERT
INTO "geolocation" ("longitude", "latitude", "lawyerId")
VALUES(50.4241869, 30.5166774, (SELECT "lawyer"."id" FROM "user" INNER JOIN "lawyer" ON "user"."id" = "lawyer"."userId" WHERE "email" LIKE 'emily@lawyer.com'));