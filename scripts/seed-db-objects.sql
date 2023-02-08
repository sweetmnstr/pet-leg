create type customer_authtype_enum as enum ('google', 'facebook', 'apple', 'email');

create type report_gender_enum as enum ('Male', 'Female');

create type report_statusofbenificiary_enum as enum ('IDP', 'Non IDP', 'Displaces abroad-TP, others', 'Refugee/Asylum seeker', 'Other person on th move', 'RETURNEE');

create type report_placeofresidence_enum as enum ('Vinnytska', 'Volynska', 'Dnipropetrovska', 'Jytomyrska', 'Donetska', 'Zakarpatska', 'Zaporizka', 'Ivano-Frankivska', 'Kyivska', 'Kirovogradska', 'Luganska', 'Lvivska', 'Mykolaivska', 'Odeska', 'Poltavska', 'Rivnenska', 'Sumska', 'Ternopilska', 'Kharkivska', 'Khersonska', 'Kmelnitska', 'Cherkaska', 'Chernihivska', 'Chernivetska');

create type report_lawservice_enum as enum ('IDP registration', 'Social welfare', 'Pension recovery', 'Civil documentation', 'HLP', 'Rules for moving abroad', 'TP,Refugee,Asylum', 'Moving within EU', 'Obtaining citizenship or a permanent residence permit', 'Exemption from conscription', 'Employment related', 'Family inc. reunification', 'Child rights', 'Education', 'Health', 'Digital service inc. Diia', 'Credits-Loans', 'Business issues', 'UXO');

create type report_typeofasstistance_enum as enum ('Consultation', 'Admin support', 'Documentation', 'In-court');

create type report_amountofconsultation_enum as enum ('1', '2', '3', '3+');

create type consultation_status_enum as enum ('pending', 'rejected', 'scheduled', 'completed', 'reviewed');

create type "timeSlot_dayoff_enum" as enum ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

create type lawyer_language_enum as enum ('uk', 'en');

create type lawyer_legal_areas_enum as enum ('Banking and Debt Finance Law', 'Charity Law', 'Commercial Law', 'Criminal Law', 'Property Law');

create type lawyer_specialization_enum as enum ('internallyDisplacedPersons', 'socialWelfarePrograms', 'pension', 'employmentIssues', 'registrationOfBirth', 'registrationOfDeath', 'diia', 'missingPerson', 'accessToHealthcare', 'accessToEducation', 'familyRelations', 'childrenAndMinors', 'goingAbroad', 'rulesForPetOwners', 'hlp', 'compensationForProperty', 'mortgageAndLoanIssues', 'willsAndInheritance', 'conscription', 'veteransRightsAndGuarantees', 'entrepreneurship', 'regulationOfVolunteerActivities', 'citizenship', 'reefugeesProtection', 'recoveryPersonalDocumentation', 'drivingLicenseAndRegistration');

create type lawyer_country_enum as enum ('ukraine', 'germany', 'poland', 'greece', 'romania', 'moldova', 'italy', 'denmark', 'serbia');

create type user_platformlanguage_enum as enum ('uk', 'en');

create type user_roles_enum as enum ('customer', 'lawyer', 'admin');

create type post_status_enum as enum ('pending', 'rejected', 'published');

create type request_type_enum as enum ('registrationRequest', 'verificationRequest');

create type request_status_enum as enum ('pending', 'rejected', 'fulfilled');

create table if not exists geolocation
(
    id        serial
        constraint "PK_36aa5f8d0de597a21a725ee1cc2"
            primary key,
    longitude double precision not null,
    latitude  double precision not null
);

create table if not exists "notificationFilters"
(
    id                             serial
        constraint "PK_f91e10e829c8084a9a71d4cc924"
            primary key,
    "customerSessionUpdates"       boolean default false not null,
    "lawyerSessionUpdates"         boolean default false not null,
    "customerNewMessages"          boolean default false not null,
    "lawyerNewMessages"            boolean default false not null,
    "customerSharedLinksUpdates"   boolean default false not null,
    "lawyerSharedLinksUpdates"     boolean default false not null,
    "customerGeneralNotifications" boolean default false not null,
    "lawyerGeneralNotifications"   boolean default false not null
);

create table if not exists "user"
(
    id                      serial
        constraint "PK_cace4a159ff9f2512dd42373760"
            primary key,
    "firstName"             text,
    "lastName"              text,
    email                   text not null,
    password                text not null,
    phone                   text,
    timezone                text,
    "platformLanguage"      user_platformlanguage_enum,
    roles                   user_roles_enum,
    photo                   text,
    "notificationFiltersId" integer
        constraint "REL_7439582f621ead31c92fa89960"
            unique
        constraint "FK_7439582f621ead31c92fa899607"
            references "notificationFilters"
);

create table if not exists customer
(
    id         serial
        constraint "PK_a7a13f4cacb744524e44dfdad32"
            primary key,
    "authType" customer_authtype_enum default 'google'::customer_authtype_enum not null,
    "userId"   integer
        constraint "REL_3f62b42ed23958b120c235f74d"
            unique
        constraint "FK_3f62b42ed23958b120c235f74df"
            references "user"
);

create table if not exists lawyer
(
    id               serial
        constraint "PK_2f066db616cefee8fc9397c6abd"
            primary key,
    title            varchar,
    "introVideo"     varchar,
    language         lawyer_language_enum,
    description      varchar,
    legal_areas      lawyer_legal_areas_enum,
    specialization   lawyer_specialization_enum[],
    education        json[],
    "workExperience" json[],
    "experienceTime" integer,
    certifications   json[],
    country          lawyer_country_enum,
    city             text,
    "hideFeedbacks"  boolean default false,
    "isVerified"     boolean default false        not null,
    "profileImage"   text,
    "userId"         integer
        constraint "REL_8323dc985c58e1d0740c065aed"
            unique
        constraint "FK_8323dc985c58e1d0740c065aed9"
            references "user"
    
);

create table if not exists geolocation
(
    id        serial
        constraint "PK_36aa5f8d0de597a21a725ee1cc2"
            primary key,
    longitude double precision not null,
    latitude  double precision not null,
    "lawyerId"   integer
        constraint "FK_3ff212cfa51f32fa5dd184378d6"
            references lawyer
);

create table if not exists feedback
(
    id           serial
        constraint "PK_8389f9e087a57689cd5be8b2b13"
            primary key,
    review       text,
    grade        double precision        not null,
    "createdAt"  timestamp default now() not null,
    "customerId" integer
        constraint "FK_ef6487793b8d734158bfe95ce5f"
            references customer,
    "lawyerId"   integer
        constraint "FK_2fd9092cf03a3da5dd184378d36"
            references lawyer
);

create table if not exists consultation
(
    id                     serial
        constraint "PK_5203569fac28a4a626c42abe70b"
            primary key,
    "communicationChannel" text,
    status                 consultation_status_enum default 'pending'::consultation_status_enum not null,
    "lawyerId"             integer
        constraint "FK_277ab4cadbc0b0c23c3f6646886"
            references lawyer,
    "customerId"           integer
        constraint "FK_d7bc975141219f3d69296b42f10"
            references customer,
    "feedbackId"           integer
        constraint "REL_c1bfa833e3bd9740689f474e44"
            unique
        constraint "FK_c1bfa833e3bd9740689f474e44f"
            references feedback
);

create table if not exists "sharedLink"
(
    id               serial
        constraint "PK_8680b3ed0eba02ec7e78c6dc1e9"
            primary key,
    link             varchar not null,
    "consultationId" integer
        constraint "FK_6bfa1982c3f4e97271b85fb019a"
            references consultation,
    "userId"         integer
        constraint "FK_46c7a703b68c09e9d6f8ed840dc"
            references "user"
);

create table if not exists report
(
    id                     serial
        constraint "PK_99e4d0bea58cba73c57f935a546"
            primary key,
    name                   text                             not null,
    gender                 report_gender_enum               not null,
    age                    integer                          not null,
    "phoneNumber"          text                             not null,
    "statusOfBenificiary"  report_statusofbenificiary_enum  not null,
    "placeOfResidence"     report_placeofresidence_enum     not null,
    "clientOther"          text,
    date                   date                             not null,
    "lawService"           report_lawservice_enum           not null,
    "caseOther"            text,
    "typeOfAsstistance"    report_typeofasstistance_enum    not null,
    "amountOfConsultation" report_amountofconsultation_enum not null,
    "moreDetails"          text,
    "consultationId"       integer
        constraint "REL_f526e862ca1a179c7abdad3f84"
            unique
        constraint "FK_f526e862ca1a179c7abdad3f848"
            references consultation
);

create table if not exists schedule
(
    id         serial
        constraint "PK_1c05e42aec7371641193e180046"
            primary key,
    "lawyerId" integer
        constraint "REL_8b9b3e1a44260bff8647be7336"
            unique
        constraint "FK_8b9b3e1a44260bff8647be7336a"
            references lawyer,
    availability json
);

create table if not exists "timeSlot"
(
    id               serial
        constraint "PK_b31a2098045a14e0b8de6e2e74e"
            primary key,
    date             date,
    "startAt"        time with time zone not null,
    "finishAt"       time with time zone not null,
    "dayOff"         "timeSlot_dayoff_enum",
    "scheduleId"     integer
        constraint "FK_02dd3aa9498900b556c4788a6cd"
            references schedule,
    "consultationId" integer
        constraint "FK_748f928a43427886b9c8029e3cb"
            references consultation
);

create table if not exists "entityFile"
(
    id         serial
        constraint "PK_413a537010ea7b48472082b336f"
            primary key,
    url        varchar not null,
    key        varchar not null,
    "entityId" integer
        constraint "FK_aeec0ad3f46d8f28a795d4abb4e"
            references "user"
);

create table if not exists "lawyers-filter"
(
    id             serial
        constraint "PK_f20fa078ffe305869bb78b397be"
            primary key,
    "filterName"   varchar not null,
    "filterValues" text[]  not null
);

create table if not exists favorite
(
    "lawyerId"   integer not null
        constraint "FK_d48db5b563a01992c6ff9e1ef9e"
            references lawyer,
    "customerId" integer not null
        constraint "FK_543e20855ce2bde06d0acb29b51"
            references customer,
    constraint lawyer_customer
        primary key ("lawyerId", "customerId")
);

create index if not exists "IDX_543e20855ce2bde06d0acb29b5"
    on favorite ("customerId");

create index if not exists "IDX_d48db5b563a01992c6ff9e1ef9"
    on favorite ("lawyerId");

create table if not exists category
(
    id       serial
        constraint "PK_9c4e4a89e3674fc9f382d733f03"
            primary key,
    title    varchar not null,
    subtitle varchar not null
);

create table if not exists post
(
    id               serial
        constraint "PK_be5fda3aac270b134ff9c21cdee"
            primary key,
    title            varchar                                                 not null,
    tags             character varying[] default '{}'::character varying[]   not null,
    content          varchar                                                 not null,
    liked            integer[]           default '{}'::integer[]             not null,
    status           post_status_enum    default 'pending'::post_status_enum not null,
    thumbnails       text[]              default '{}'::text[]                not null,
    "createdAt"      timestamp           default now()                       not null,
    "enableComments" boolean             default true                        not null,
    "createdById"    integer
        constraint "FK_f91b3264d721d9a0f63dfdd3a4b"
            references "user",
    "categoryId"     integer
        constraint "FK_1077d47e0112cad3c16bbcea6cd"
            references category
);

create table if not exists comment
(
    id            serial
        constraint "PK_0b0e4bbc8415ec426f87f3a88e2"
            primary key,
    content       text                    not null,
    "createdAt"   timestamp default now() not null,
    "postId"      integer
        constraint "FK_94a85bb16d24033a2afdd5df060"
            references post,
    "createdById" integer
        constraint "FK_63ac916757350d28f05c5a6a4ba"
            references "user"
);

create table if not exists "refresh-session"
(
    id             serial
        constraint "PK_73f1d77fff68d934b53118b0491"
            primary key,
    "userId"       integer not null,
    "refreshToken" text    not null,
    fingerprint    text    not null,
    ip             text    not null,
    ua             text,
    "expiresIn"    bigint  not null
);

create table if not exists faq
(
    id   serial
        constraint "PK_d6f5a52b1a96dd8d0591f9fbc47"
            primary key,
    name text not null
);

create table if not exists question
(
    id           serial
        constraint "PK_21e5786aa0ea704ae185a79b2d5"
            primary key,
    question     text not null,
    answer       text not null,
    "categoryId" integer
        constraint "FK_b8dd754e373b56714ddfa8f545c"
            references faq
);

create table if not exists recomendations
(
    id      serial
        constraint "PK_da2bebfc90f32376668a1060146"
            primary key,
    type    text   not null,
    values  text[] not null,
    locales json   not null
);

create table if not exists conversation
(
    id           serial
        constraint "PK_864528ec4274360a40f66c29845"
            primary key,
    "externalId" text                 not null,
    "user1Id"    integer              not null,
    "user2Id"    integer              not null,
    "user1Read"  boolean default true not null,
    "user2Read"  boolean default true not null
);

create table if not exists request
(
    id            serial
        constraint "PK_167d324701e6867f189aed52e18"
            primary key,
    "requesterId" integer
        constraint "UQ_6388413f99d4d9efe296e6fdd88"
            unique
        constraint "FK_6388413f99d4d9efe296e6fdd88"
            references "user",
    type          request_type_enum       not null,
    "assigneeId"  integer
        constraint "UQ_4371ef945113f61a360c0311b54"
            unique
        constraint "FK_4371ef945113f61a360c0311b54"
            references "user",
    context       varchar,
    email       varchar,
    status        request_status_enum     not null,
    "createdAt"   timestamp default now() not null
);