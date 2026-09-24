--
-- PostgreSQL database dump
--

\restrict 9JgDCvZxOrdrPRQdH6mgtX8gIM3jZSLCC5k6rmuSyrGjVy83Aa07d4sNIUiTkBg

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AssetType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssetType" AS ENUM (
    'IMAGE',
    'VIDEO'
);


ALTER TYPE public."AssetType" OWNER TO postgres;

--
-- Name: ROLE; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ROLE" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public."ROLE" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: assetfolders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assetfolders (
    "assetId" text NOT NULL,
    "folderId" text NOT NULL,
    "isOwner" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.assetfolders OWNER TO postgres;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    id text NOT NULL,
    "assetName" text NOT NULL,
    type public."AssetType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "fileSize" integer NOT NULL,
    "s3Key" text NOT NULL,
    "ownerId" text NOT NULL,
    "coverImage" text,
    "mainFolder" text,
    width integer NOT NULL,
    height integer NOT NULL
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- Name: assettags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assettags (
    "assetId" text NOT NULL,
    "tagId" integer NOT NULL
);


ALTER TABLE public.assettags OWNER TO postgres;

--
-- Name: collaborators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collaborators (
    "folderId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.collaborators OWNER TO postgres;

--
-- Name: folders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.folders (
    id text NOT NULL,
    "folderName" text NOT NULL,
    "parentId" text,
    "isPublic" boolean DEFAULT true NOT NULL,
    "userId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.folders OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tokens (
    id text NOT NULL,
    token text NOT NULL,
    "expireAt" timestamp(3) without time zone NOT NULL,
    "isVaild" boolean DEFAULT true NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.tokens OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    role public."ROLE" DEFAULT 'user'::public."ROLE" NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d697d333-5cf9-4f23-9547-2d242665c091	5d763ce8ef77c1b9bdc0d7eb4aabfb44b73511c3982d52acadc8f21f6e86535c	2026-05-10 16:45:55.260842+03	20260407171939_init_setup	\N	\N	2026-05-10 16:45:55.197762+03	1
405cbdba-1269-4288-b4b2-a43e44bb5878	7ca78d5239142909107f06b71d80dcb24ebe2bf7b81dfd98cc5fabd466cf06d9	2026-05-10 16:45:55.268702+03	20260407202627_asset_current_ver_id_optional	\N	\N	2026-05-10 16:45:55.261769+03	1
970b2d29-a33b-4da6-80bd-ad2d6aea1658	19f1b1568294457cb0c1d52a867155bd19bf4117f22e17b7733788413fa6152b	2026-05-10 16:45:55.298829+03	20260411150838_tag_asset_tag_tables	\N	\N	2026-05-10 16:45:55.26974+03	1
e4419175-f855-4f4b-9e79-1584a79f8ea7	609dafaa0e2afe019b61f6b876891e038aba16082a8c121f63ae7bbd9277ee72	2026-05-10 16:45:55.309615+03	20260411153320	\N	\N	2026-05-10 16:45:55.299791+03	1
b5be0ee6-008a-4d04-89b7-7e569db4807e	6972b869c129ae611e4a085bffbdcd07261dce2979c72061c3330e1830017147	2026-05-10 16:45:55.314963+03	20260411192650_tagname_assettags	\N	\N	2026-05-10 16:45:55.310937+03	1
b1ce58be-2116-49a3-91c2-a0f58db114ea	ec758de15f54b3059b63a6c69b658f56e097feeaec53d915ff0eca1437262b3f	2026-05-10 16:45:55.324581+03	20260422114439_add_is_active	\N	\N	2026-05-10 16:45:55.315778+03	1
f28fb5ef-bddc-4264-b732-19424faefbfb	b468bc3e5f86c53018b551c11a636596af01440966afeed6bf40c83ea8a91f25	2026-05-10 16:45:55.330139+03	20260422154643	\N	\N	2026-05-10 16:45:55.32566+03	1
22c5aa7c-391d-41a5-9c2e-bf8fb7bfd77e	d044cd0dfacc1ffb0c7cf55a1cabb94f2ac2c70ca1f8d7292c7b171875f0248a	2026-05-10 16:45:55.33593+03	20260424142929_add_roles	\N	\N	2026-05-10 16:45:55.331323+03	1
22fd8206-c109-49fa-a81e-f4d6756de57b	7a8835d7e3597576bf7f371907a7f5bbc355c250f71631a79af46b897855b2a2	2026-05-10 16:45:55.344874+03	20260508085424_remove_version_model	\N	\N	2026-05-10 16:45:55.336726+03	1
da024c3e-cbd3-4a63-91b5-23a5edaa9c33	e6f174351823902487fcaed35fd94a48ea5c7cef8731c59d51a6ad4140d2c473	2026-05-10 21:11:49.959894+03	20260510180854_new_schema	\N	\N	2026-05-10 21:11:49.932611+03	1
5f7472b4-6dfc-482b-ae3d-64f741fa4b7e	ea754aa574107bc6be48c67d136172bbb3ed5d6d778d95f77dc0df905c64cc68	2026-05-10 21:16:09.99278+03	20260510181544_add_cover_image	\N	\N	2026-05-10 21:16:09.987234+03	1
1ae83243-ffc5-488f-af8f-f7a1e368f8bf	e000efb4768a2d97c4744a17353861ab2fe97878f4a01ee5c68d4f4ee5ba73c2	2026-05-10 22:35:59.251362+03	20260510193559_cover_image_optional	\N	\N	2026-05-10 22:35:59.247671+03	1
19f25bc2-a905-49dd-80a4-6b18a49d4d16	b31cc866bfbf1b1f81fb5759e9780f0d4059c24734ab378ddf4ae007c30e0e33	2026-05-11 15:55:48.629777+03	20260511123558_asset_folder_1_m	\N	\N	2026-05-11 15:55:48.619232+03	1
d845f787-abca-4f38-9de2-d316c2ada3af	445c25cc0f2dcb86db289662d5650aa3e92c687cd82eecfd818260d1047c30b2	2026-06-21 14:55:43.524545+03	20260621115512_assettag_fk_on_delete_cascade	\N	\N	2026-06-21 14:55:43.502204+03	1
a852a507-12dd-4d78-a567-2c59e66fe7ee	c4e3e06fc247a697df6cda9fab304ac208ff4b98a2e06e3d21e7081d1bfcb693	2026-05-11 15:55:51.664781+03	20260511125551	\N	\N	2026-05-11 15:55:51.659501+03	1
64f4c263-277c-4b83-9e00-55fc2bbe577e	8588ece91ef66a7120eae2da28e900a68fcd0350cb85bcf64843101ac4666776	2026-05-11 15:58:19.370842+03	20260511125709_remove_folder_id	\N	\N	2026-05-11 15:58:19.36189+03	1
2ff3687d-5e7b-4019-828a-ea1a206a0764	c4e3e06fc247a697df6cda9fab304ac208ff4b98a2e06e3d21e7081d1bfcb693	2026-05-11 15:59:51.493587+03	20260511125951	\N	\N	2026-05-11 15:59:51.486357+03	1
4c2b9daf-656c-494f-8839-140bcac1ad0b	6f83a99b16bfdc5a5b305573347a3de1aeea879ae31f8fb177a6b26ea41d0d0a	2026-05-20 07:17:14.397227+03	20260520041538_add_collaborators	\N	\N	2026-05-20 07:17:14.371081+03	1
a7b43421-ea80-491f-a3d1-c93b30465622	a343fa75968b45657da22ec54312fc0cde51b81c67cc2d453f175d25328ebaef	2026-05-24 22:34:46.413789+03	20260524193401_remove_tag_name	\N	\N	2026-05-24 22:34:46.406043+03	1
4ec450e0-e776-4d96-82ed-452ab49fa8a7	adee575ccce8ca1f77ccfe24ffbe0abcb394d08f6e168da73a21848d78c3d3a0	2026-06-22 08:43:56.005847+03	20260621143520_asset_add_dimensions	\N	\N	2026-06-22 08:43:55.984002+03	1
a01d6e02-a23b-4937-b7e9-5f5d6e147fd4	270687dbee385398dab25ce5e1fb26a0808fe1feff456555168c0d08de6022e8	2026-05-24 22:34:49.211112+03	20260524193449	\N	\N	2026-05-24 22:34:49.202186+03	1
53f6e9b9-e04f-4bb9-9275-790b940f2486	0d511b196d55bd99a9dee55a2c74475f795526ffa560f7181b4d9ac2a79f9fef	2026-05-24 22:54:01.648008+03	20260524195157_remove_tag_name_constraint	\N	\N	2026-05-24 22:54:01.643544+03	1
\.


--
-- Data for Name: assetfolders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assetfolders ("assetId", "folderId", "isOwner", "createdAt") FROM stdin;
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, "assetName", type, "createdAt", "updatedAt", description, "isActive", "fileSize", "s3Key", "ownerId", "coverImage", "mainFolder", width, height) FROM stdin;
a25f1cf0-5815-4fc1-892f-62a4a03c632d	الشيخ محمد عمران	IMAGE	2026-05-11 08:24:27.759	2026-05-11 08:27:35.325	تلاوة عطرة للشيخ محمد عمران رحمه الله	f	1024	uploads/2026-05-11-a25f1cf0-5815-4fc1-892f-62a4a03c632d/الشيخ محمد عمران	0712f227-c70c-4714-afc2-15d13b1782e7	\N	\N	250	200
52e9ee2f-b97d-4a2b-a160-77c3b9033789	نتيجة المعصية	IMAGE	2026-06-21 12:15:56.858	2026-06-21 12:15:56.858	عقوبة المعصية	t	1024	uploads/2026-06-21-52e9ee2f-b97d-4a2b-a160-77c3b9033789/نتيجة المعصية.jpg	2ae939c0-70a9-423d-ac93-aae04581fe44	\N	\N	250	200
a3b9751b-1917-4992-bfa4-7d1981cafad9	خلفية قرآنية	IMAGE	2026-06-21 12:20:18.192	2026-06-21 12:20:18.192	آيات من سورة طه في خلفية سحابية	t	1024	uploads/2026-06-21-a3b9751b-1917-4992-bfa4-7d1981cafad9/خلفية قرآنية.png	e117735a-2918-40bf-92f1-8491af5b8e6b	\N	\N	250	200
680c7616-e57c-4fa2-8e3f-9acba5e492cd	White Eagle	IMAGE	2026-06-21 12:27:47.657	2026-06-21 12:27:47.657	White Eagle - High Quailty Photo	t	1024	uploads/2026-06-21-680c7616-e57c-4fa2-8e3f-9acba5e492cd/White Eagle.jpg	e117735a-2918-40bf-92f1-8491af5b8e6b	\N	\N	250	200
ad6795fb-30db-4eda-ba4d-46993a05a2f0	قد تتأخر فتسبق الجميع	IMAGE	2026-06-21 12:31:05.397	2026-06-21 12:31:05.397	قد تتأخر فتسبق الجميع	t	1024	uploads/2026-06-21-ad6795fb-30db-4eda-ba4d-46993a05a2f0/قد تتأخر فتسبق الجميع.jpg	e117735a-2918-40bf-92f1-8491af5b8e6b	\N	\N	250	200
15b0ce4a-43b3-4d8a-be0e-885b919c30b3	White Eagle with dimensions	IMAGE	2026-06-22 06:15:34.739	2026-06-22 06:15:34.739	A portrait image with dimensions specified after adding them in teh db schema	t	1024	uploads/2026-06-22-15b0ce4a-43b3-4d8a-be0e-885b919c30b3/White Eagle with dimensions.jpg	e117735a-2918-40bf-92f1-8491af5b8e6b	\N	\N	736	1313
\.


--
-- Data for Name: assettags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assettags ("assetId", "tagId") FROM stdin;
\.


--
-- Data for Name: collaborators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collaborators ("folderId", "userId", "createdAt") FROM stdin;
a90868a7-ee83-4918-bdbd-91790f369edb	2ae939c0-70a9-423d-ac93-aae04581fe44	2026-05-20 15:21:36.983
a90868a7-ee83-4918-bdbd-91790f369edb	9d05232c-77ec-4ee4-a574-8035e03f8590	2026-05-25 10:52:46.763
\.


--
-- Data for Name: folders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.folders (id, "folderName", "parentId", "isPublic", "userId", "isActive") FROM stdin;
a90868a7-ee83-4918-bdbd-91790f369edb	Mosques	\N	t	0712f227-c70c-4714-afc2-15d13b1782e7	t
8afe0432-9933-44d7-8b26-93c1f4f38fba	Saved - 2nd Account	\N	t	2ae939c0-70a9-423d-ac93-aae04581fe44	t
d1b32c86-1bc7-4162-9008-d384c8fe4351	Private - 2nd Account	\N	f	2ae939c0-70a9-423d-ac93-aae04581fe44	t
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, name) FROM stdin;
1	quran
2	forests
3	islam
4	religious
5	fitness
6	sport
7	health
8	nutrition
\.


--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tokens (id, token, "expireAt", "isVaild", "userId") FROM stdin;
b854a192-eb4f-4d07-bb88-d2d96fc61bf5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzg0NDQ5MDgsImV4cCI6MTc3OTA0OTcwOH0.v4gWcDBKhwQF5kcqv7PDZL_HRGdL0wtYrVOz3D0jcec	2026-05-17 20:28:28.874	t	2ae939c0-70a9-423d-ac93-aae04581fe44
e00ba86f-b3a5-41d3-aaea-f9c9af7d4482	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg0NDUwNTUsImV4cCI6MTc3OTA0OTg1NX0.bM07gbU6XNhojzuZm-PVXT-CiPgWvb8uDDeVAMXltJw	2026-05-17 20:30:55.024	t	0712f227-c70c-4714-afc2-15d13b1782e7
a6abb796-f994-4c33-8c93-5c444bf6b6f8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg0NDU1NjMsImV4cCI6MTc3OTA1MDM2M30.b-THpdIdLi3AM_T13Gz_UPc4x_OXVdZUCdYIrOOVuFs	2026-05-17 20:39:23.288	t	0712f227-c70c-4714-afc2-15d13b1782e7
6ce869dd-5065-43de-a07a-b6f86333a239	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg0NDU1OTEsImV4cCI6MTc3OTA1MDM5MX0.2e9dQmDXOeq-HuYrhO6wr7pFYQcxHbQT-9QhSeEyGlk	2026-05-17 20:39:51.388	t	0712f227-c70c-4714-afc2-15d13b1782e7
9c8ff19b-217c-495c-a98b-f7e746ce2f7d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg0NDU2MDEsImV4cCI6MTc3OTA1MDQwMX0.d6ASufLmqQ-XlxDMKtGTqk1rHshJvmQs-EA_bAk5Smk	2026-05-17 20:40:01.92	t	0712f227-c70c-4714-afc2-15d13b1782e7
c3a11834-d545-4bec-bc72-ee34b60e2959	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg0NDU2ODgsImV4cCI6MTc3OTA1MDQ4OH0.W8GQ7jUGyyOqZxbcs-9pezaOEjN1enXxce9thhDUpTU	2026-05-17 20:41:28.834	t	0712f227-c70c-4714-afc2-15d13b1782e7
3a4daf80-1de4-4145-9a76-c51287d18da3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZDA1MjMyYy03N2VjLTRlZTQtYTU3NC04MDM1ZTAzZjg1OTAiLCJpYXQiOjE3Nzg0NDU4OTcsImV4cCI6MTc3OTA1MDY5N30.4GfrxeYo1_gIGgl-hVxGnV628Zc-K9LZeeZtb_Kb1p0	2026-05-17 20:44:57.181	t	9d05232c-77ec-4ee4-a574-8035e03f8590
a5d50887-fc0b-492e-86f2-64d7cc0301f3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg0NDY3ODgsImV4cCI6MTc3OTA1MTU4OH0.kTO1qsk8YG4_lmfObYK3Xhh1PTihuXzG4LoHf2pA6cs	2026-05-17 20:59:48.548	t	0712f227-c70c-4714-afc2-15d13b1782e7
a77e1f63-5391-4778-9b19-f5f5a8821ede	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg0ODcyNzUsImV4cCI6MTc3OTA5MjA3NX0.lxkNCcYSG3tOFNLMEOOMyjKmrbyOtH0nc4rS4JWHwjM	2026-05-18 08:14:35.882	t	0712f227-c70c-4714-afc2-15d13b1782e7
7e59f5f9-653b-46df-a488-3effd5de0a0e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg0ODczMTIsImV4cCI6MTc3OTA5MjExMn0.dLPXgQbyy1j0KR3e1MJEKwRrCFDPFJYfOzy4VIy3aW8	2026-05-18 08:15:12.688	t	0712f227-c70c-4714-afc2-15d13b1782e7
d8f04e20-281d-411d-84ed-0ebad655c963	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg0ODc1NjgsImV4cCI6MTc3OTA5MjM2OH0.4RrwUKQl3UtAuWNznElRh6mzDjG2t5M535vMbLyest0	2026-05-18 08:19:28.741	t	0712f227-c70c-4714-afc2-15d13b1782e7
4bb32a28-17e5-4b87-94a4-fafdccd040f9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzg5ODk4NzIsImV4cCI6MTc3OTU5NDY3Mn0.cXnYR3moUahLlsE6ILbsDh_6CwFuDieKP0ycFAWD1sQ	2026-05-24 03:51:12.529	t	0712f227-c70c-4714-afc2-15d13b1782e7
eede0a28-fe1e-492d-ae4b-a01115cd35b3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3NzkwMzk5NTAsImV4cCI6MTc3OTY0NDc1MH0.BFG35rrkIWLZDWSZeaCJiSzeW6tvrgSbTuk3fPT0ffw	2026-05-24 17:45:50.93	t	0712f227-c70c-4714-afc2-15d13b1782e7
e2da1b4f-d930-4ac3-9377-e78a3bb7e875	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3NzkwOTMxODgsImV4cCI6MTc3OTY5Nzk4OH0.UmpchwyEXjvehsC9tpVZBXRP9K4inQ85GjSHNTjLHu8	2026-05-25 08:33:08.657	t	0712f227-c70c-4714-afc2-15d13b1782e7
17521e58-f3df-4bc6-9a2b-2ba1be303a02	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3NzkwOTM1NzEsImV4cCI6MTc3OTY5ODM3MX0.pY5Eux6FtIUYWMCALEV9cT5pJAlRhTWlmmYJpV9FAok	2026-05-25 08:39:31.047	t	2ae939c0-70a9-423d-ac93-aae04581fe44
44fb8f50-a2c6-417f-bbfe-76144395178e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3NzkwOTYwMjMsImV4cCI6MTc3OTcwMDgyM30.2An17wrJB8oqi_jxDkwRgmywGJ1R9MlfsOb5RgwAfwM	2026-05-25 09:20:23.235	t	0712f227-c70c-4714-afc2-15d13b1782e7
60428500-52a0-41e4-8e18-a520ebdb2bfd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3NzkwOTc4OTYsImV4cCI6MTc3OTcwMjY5Nn0.fRBUeCkiVnMK0g82fKfEGNMa-mkxkRgGhdnnkHptYCo	2026-05-25 09:51:36.702	t	2ae939c0-70a9-423d-ac93-aae04581fe44
0ff1330a-a622-4b1a-b0b2-c9af16aea847	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3NzkwOTgwOTEsImV4cCI6MTc3OTcwMjg5MX0.GNbp0SGD-ZMiK2H45bC0xL0pyHw40t050o9jh0ARmxM	2026-05-25 09:54:51.596	t	e117735a-2918-40bf-92f1-8491af5b8e6b
7bcc31ba-9f2f-4f51-b073-2aff1f8ee2f7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3NzkyOTAxMjYsImV4cCI6MTc3OTg5NDkyNn0.3cZ-ftC3GImLX3zjTTs0XpPa4F7nuZ3rrkJMlrm1Q5o	2026-05-27 15:15:26.871	t	2ae939c0-70a9-423d-ac93-aae04581fe44
b576a4d0-5833-41d5-abfe-d4dcd4bb79ac	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk0Mzk3NDAsImV4cCI6MTc4MDA0NDU0MH0.FcK-bDteKhQMCOwkHBclpuAaT4eHyMmc6s98DXp7nLI	2026-05-29 08:49:00.549	t	2ae939c0-70a9-423d-ac93-aae04581fe44
ff2c8e3a-fcf6-47d0-8fa1-bfd6b8804694	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk0Mzk4NjEsImV4cCI6MTc4MDA0NDY2MX0.bthiYB8Ee07UNaIx0MGXCbRiJcVrs7XnH-YGzlatzp0	2026-05-29 08:51:01.552	t	2ae939c0-70a9-423d-ac93-aae04581fe44
b547ad1e-a4d7-4398-a147-1969b07ca8ea	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk0Mzk4NzAsImV4cCI6MTc4MDA0NDY3MH0.34SvcztTwAK2pe9jIsBowtGEEBFa0K6TWCP_fGYbzMM	2026-05-29 08:51:10.305	t	2ae939c0-70a9-423d-ac93-aae04581fe44
d69bad84-d99a-4780-9b22-46a23d74d92e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk0Mzk5MjUsImV4cCI6MTc4MDA0NDcyNX0.CrcYCk-K3FHLPXcqVoYMxrF8DXgUsrUz38ky9R6B6Y0	2026-05-29 08:52:05.395	t	2ae939c0-70a9-423d-ac93-aae04581fe44
5aebb73d-41ae-4a95-895e-a0c05c3e4c43	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk0NDAwMDQsImV4cCI6MTc4MDA0NDgwNH0.8S8H-iEwcCjlf6HlBHt6yogYkAoWLq5HJCy7eeO-FMo	2026-05-29 08:53:24.22	t	0712f227-c70c-4714-afc2-15d13b1782e7
94c5a01e-b91b-4b6a-8ec1-9b865b199062	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk1Mjc4NDQsImV4cCI6MTc4MDEzMjY0NH0.kN0AYt_QCJLdxm6-8g5s5MSjqrw0HS_1K2lahpXaR9w	2026-05-30 09:17:24.419	t	2ae939c0-70a9-423d-ac93-aae04581fe44
187d6081-d721-4139-b31f-0d6504e7b477	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk2Mzg3MjcsImV4cCI6MTc4MDI0MzUyN30.3goK4zseyEBH-7bnOxD6wBI31m8tCwsOafCJiJn7iHY	2026-05-31 16:05:27.054	t	2ae939c0-70a9-423d-ac93-aae04581fe44
109ed4b9-3d1e-47ad-a225-fafcdd8afd0f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk2Mzg4MDIsImV4cCI6MTc4MDI0MzYwMn0.tCb1rq4vPj6Ni6MICEeRjyk88NbOjI6gbv_Fl_OaM_g	2026-05-31 16:06:42.514	t	0712f227-c70c-4714-afc2-15d13b1782e7
8da28167-f334-4ae1-a752-a5a633f301cc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk2Mzg4NDYsImV4cCI6MTc4MDI0MzY0Nn0.gdwPx1BRHR86pwhreMirNfoEEdGkQNY1SobfA25U6Jc	2026-05-31 16:07:26.4	t	2ae939c0-70a9-423d-ac93-aae04581fe44
3eba24ac-89bf-4fef-a12b-ca92718fc6e1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk2Mzg5MjIsImV4cCI6MTc4MDI0MzcyMn0.0QtasyFlncErw-gwYj3Xjqmsg8xwAnk9qnmPT294nQ8	2026-05-31 16:08:42.189	t	2ae939c0-70a9-423d-ac93-aae04581fe44
5258e58b-ab1b-4107-91ac-0ab1dd6ae70a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk2Mzg5MjcsImV4cCI6MTc4MDI0MzcyN30.MdbJnDrVrcok-o9uq9Qig37fvSrEPKGvExbED24VsqY	2026-05-31 16:08:47.634	t	0712f227-c70c-4714-afc2-15d13b1782e7
d3341739-18c0-4912-84f4-b76c781386e3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OTA2Nzc3My03ZTYyLTRmMmMtYWQ5YS0wNDk0NWMyMGEzMDYiLCJpYXQiOjE3Nzk2OTU5OTYsImV4cCI6MTc4MDMwMDc5Nn0.4OGdXuXewoqzplRPkEn69uh8Idy5GXSzGz3Q_w2bKkM	2026-06-01 07:59:56.454	t	59067773-7e62-4f2c-ad9a-04945c20a306
4d2a1296-74ca-4147-a7ab-d6356016fde5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZmI4NDIxOC01MmIxLTQ3MjctYTY4Ni03OTU5MDU3NDY4NzQiLCJpYXQiOjE3Nzk2OTYwNTUsImV4cCI6MTc4MDMwMDg1NX0.qBs0NbjyASzweQ4Xmt04-4vyVaE3LPSbSIzC7RB6iCg	2026-06-01 08:00:55.16	t	7fb84218-52b1-4727-a686-795905746874
9cb4ca1d-38f1-40f1-b295-7eb349c1a068	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWY5ZGI2MC00YTVjLTQ5YmYtOWEwNS1mZGVlYWY2MDZmZTIiLCJpYXQiOjE3Nzk2OTYwOTIsImV4cCI6MTc4MDMwMDg5Mn0.nj3V6J3Oh55yLlOPTOVeCtNeNY-YfMDi0vvf80WW3no	2026-06-01 08:01:32.947	t	5ef9db60-4a5c-49bf-9a05-fdeeaf606fe2
4772e76e-3318-45e8-bf28-67c4a7b0ad10	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZWUzZTI3NC05MjdkLTRkNjItYmU1OC00ZjI4M2Q1MjYzZjEiLCJpYXQiOjE3Nzk2OTYxODYsImV4cCI6MTc4MDMwMDk4Nn0.ouiNLztTPTXyfqsy1slSCF4HEFvYcXPwNJLcRtqTOck	2026-06-01 08:03:06.117	t	aee3e274-927d-4d62-be58-4f283d5263f1
00655b54-5a53-4151-a8a1-5749cdd3051c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk2OTY3NTgsImV4cCI6MTc4MDMwMTU1OH0.dZyU6cFQi82YuWDf7QcfEIyov5WOO1pznmSVLMlfNM4	2026-06-01 08:12:38.849	t	0712f227-c70c-4714-afc2-15d13b1782e7
33527530-1742-44e7-8111-4d21d602d55e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk3MDUwNTAsImV4cCI6MTc4MDMwOTg1MH0.GYFZ2KkAOW2cW6LPTjLsfRENMoxWDt0oUHhXS0Nnn44	2026-06-01 10:30:50.251	t	0712f227-c70c-4714-afc2-15d13b1782e7
47c480b7-ea48-4ef9-8a37-a1fb3cdd6ec2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk3OTcwOTQsImV4cCI6MTc4MDQwMTg5NH0.rbm0ETmnp1IFGr6cdvyhLHOAWStWNNi-jmwS_aCzLf8	2026-06-02 12:04:54.656	t	0712f227-c70c-4714-afc2-15d13b1782e7
c07e2bc9-4eb0-4527-8542-6dd7d26596fa	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3Nzk4MDE0MjUsImV4cCI6MTc4MDQwNjIyNX0.Xfzxqailw7PuWO0sSjPidMisfUAj8svftpUxQxzIHsg	2026-06-02 13:17:05.235	t	e117735a-2918-40bf-92f1-8491af5b8e6b
e305cd9d-e121-40db-a4fe-322031bd7ab9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3Nzk4MDI1OTYsImV4cCI6MTc4MDQwNzM5Nn0.ZmtmjKznSCeUxlqKj6eTXDKgajcimpIJIiMA79ISjkE	2026-06-02 13:36:36.251	t	e117735a-2918-40bf-92f1-8491af5b8e6b
dda55f38-642a-4174-9849-ecff8ac36338	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk4MDI4OTksImV4cCI6MTc4MDQwNzY5OX0.2r2II7D6hqnkbpehCpC0bqmAgDFakFRbU-3QnsY4Bic	2026-06-02 13:41:39.937	t	2ae939c0-70a9-423d-ac93-aae04581fe44
561900b6-73de-4985-93cf-156e91fcb5e5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk4MDY0NTcsImV4cCI6MTc4MDQxMTI1N30.hgA_IP7Yu0AtePQb8H-GxcoXRGxsV1lorF6Z7k5-2uc	2026-06-02 14:40:57.169	t	0712f227-c70c-4714-afc2-15d13b1782e7
8b0dd972-91c0-4e45-aee2-b3bf55e5dd06	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk4MDY3NjUsImV4cCI6MTc4MDQxMTU2NX0.0ndZJGcbW3I0WVVUMHyZFlUJaVlRrpI1fyD1p3fwgZc	2026-06-02 14:46:05.169	t	2ae939c0-70a9-423d-ac93-aae04581fe44
6a4edb04-25f9-4174-89db-ecf43a636ae3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk4MDY3NzMsImV4cCI6MTc4MDQxMTU3M30.O5Oba18qZYgrJMNfrawlHMtQPumI-XkwoDF4DBomKWg	2026-06-02 14:46:13.897	t	2ae939c0-70a9-423d-ac93-aae04581fe44
17907059-2a64-44d2-bf2d-f03f14b1422f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk4MDcwMjUsImV4cCI6MTc4MDQxMTgyNX0.1DISvOu6j0_M-B6XWS0SXX8lxWglEWhX_sHLCysz59E	2026-06-02 14:50:25.285	t	0712f227-c70c-4714-afc2-15d13b1782e7
da8d4755-889f-4e68-a92a-368aebdff3b8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3Nzk4Nzk2MzAsImV4cCI6MTc4MDQ4NDQzMH0.upiKLZzfQEhDfwaZch4oZWeaLIaw0X4uEyOTMcB7Hjg	2026-06-03 11:00:30.904	t	e117735a-2918-40bf-92f1-8491af5b8e6b
30c7eb04-569b-45e6-b8d1-4bd573ac685b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk4Nzk2NzYsImV4cCI6MTc4MDQ4NDQ3Nn0.VXxq-lIOEq5KfcD61sxND5VjmB7AAWGP_7b4-VvdJc4	2026-06-03 11:01:16.133	t	2ae939c0-70a9-423d-ac93-aae04581fe44
dbde8f2a-822b-4a27-8c41-91c8adbc554b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3Nzk4Nzk4NjEsImV4cCI6MTc4MDQ4NDY2MX0.bsxy7EtKbCLy1xAOBBYOxMo6stHCDKBLBqvzMbcDnTg	2026-06-03 11:04:21.56	t	e117735a-2918-40bf-92f1-8491af5b8e6b
61d4eb32-b313-4392-ac16-94e0aa2318c9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk4Nzk4NzEsImV4cCI6MTc4MDQ4NDY3MX0.H7Y69gcuoqBcbIuji3HaOr81u9HI_5ze8GRbA-QmFnk	2026-06-03 11:04:31.124	t	0712f227-c70c-4714-afc2-15d13b1782e7
f9693efd-0594-46a5-8db5-f2f564cd44a7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3Nzk4Nzk5OTAsImV4cCI6MTc4MDQ4NDc5MH0.LOolB5bdxbbjylYVMMDK78pWmrAhFgV0LuH-Uvsn9aQ	2026-06-03 11:06:30.595	t	e117735a-2918-40bf-92f1-8491af5b8e6b
774bfdd8-c1b7-4c2b-9eb0-9b1daac8f242	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk4ODA5ODksImV4cCI6MTc4MDQ4NTc4OX0.eENIFe3XK8wYcyakqEesiHf0vRRFB_PwYJPxgS9bOLE	2026-06-03 11:23:09.486	t	0712f227-c70c-4714-afc2-15d13b1782e7
7021c456-4017-45e0-87a2-0f932dba162e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk4ODExNzAsImV4cCI6MTc4MDQ4NTk3MH0.DPDC2HgSr6ueHQqHuEskDqBpueo9O2I5tkzLdojtjMQ	2026-06-03 11:26:10.399	t	2ae939c0-70a9-423d-ac93-aae04581fe44
60fa847f-ca87-4327-bce4-de6d379f1fec	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzEyZjIyNy1jNzBjLTQ3MTQtYWZjMi0xNWQxM2IxNzgyZTciLCJpYXQiOjE3Nzk4ODEzMTUsImV4cCI6MTc4MDQ4NjExNX0.r_GdvfdG-IowpOi6iZPNVZYuaC7K0IzAHN2fo5NhoIY	2026-06-03 11:28:35.758	t	0712f227-c70c-4714-afc2-15d13b1782e7
a6e9f502-0067-4f77-bffc-3c3fe0e33806	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3Nzk4ODEzMzAsImV4cCI6MTc4MDQ4NjEzMH0.tBTIQClJ5_CiBBDs_pnrOvIGXZLgfg8Li2wWtcj1eCo	2026-06-03 11:28:50.334	t	2ae939c0-70a9-423d-ac93-aae04581fe44
24dd72fd-8a2b-4c89-a835-27d874cb98a6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3ODAyMzM5OTksImV4cCI6MTc4MDgzODc5OX0.d4zptXXPuGT5Ca6mLCioHFhTUXUA9TFOqBSB05ivLog	2026-06-07 13:26:39.693	t	2ae939c0-70a9-423d-ac93-aae04581fe44
0730c84a-97b0-466b-bf99-eb3a67b2a2ba	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3ODIwNDI2NzksImV4cCI6MTc4MjY0NzQ3OX0.Nh2IAf78gnT6q4jk9tDRnwpUT8fiVgHRAxc7miQb6Is	2026-06-28 11:51:19.412	t	e117735a-2918-40bf-92f1-8491af5b8e6b
4705b26a-114b-4a50-82c6-15685a6b9969	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3ODIwNDI2OTAsImV4cCI6MTc4MjY0NzQ5MH0.N1YCtF-T5UTW13hJgZGLOhdT-fz5K8sepL3icIniDTw	2026-06-28 11:51:30.977	t	e117735a-2918-40bf-92f1-8491af5b8e6b
c9583962-10bb-458a-9c62-3522a9d7701b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3ODIwNDI2OTEsImV4cCI6MTc4MjY0NzQ5MX0.P4sjNUEzn_rdxpwuNMVV9keLeY-9rwH9OfqLSWhXhHY	2026-06-28 11:51:31.643	t	e117735a-2918-40bf-92f1-8491af5b8e6b
47a94ce3-1a70-4c0c-a602-203babdc126f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3ODIwNDI2OTIsImV4cCI6MTc4MjY0NzQ5Mn0.NYcQ_u0rQzIT_LqYfBU6SWnoVt1GhTnf60YmLvRMG0c	2026-06-28 11:51:32.122	t	e117735a-2918-40bf-92f1-8491af5b8e6b
a0dec0dd-01e1-4205-aea9-b3a71c1f1063	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3ODIwNDI2OTMsImV4cCI6MTc4MjY0NzQ5M30.xoK-zCHec0EtoBZgG87tUzTzAiShZSkd9m1zTiSRfEk	2026-06-28 11:51:33.161	t	e117735a-2918-40bf-92f1-8491af5b8e6b
97f46063-17c3-4bed-81a6-543b9c5439f1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3ODIwNDI2OTYsImV4cCI6MTc4MjY0NzQ5Nn0.9NfCh0SWdscclIJuW5gnl2aj9KIojiuoTG8Lcz3eIxo	2026-06-28 11:51:36.794	t	e117735a-2918-40bf-92f1-8491af5b8e6b
55efb96c-c9cc-42cd-992d-fff06662e2cb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWU5MzljMC03MGE5LTQyM2QtYWM5My1hYWUwNDU4MWZlNDQiLCJpYXQiOjE3ODIwNDQxNDksImV4cCI6MTc4MjY0ODk0OX0.xC5_wChzBQvRpL1TYFl_L2M-fvQqlUmFfHRxox6e8Yk	2026-06-28 12:15:49.344	t	2ae939c0-70a9-423d-ac93-aae04581fe44
ddcb5b90-1a61-44e3-b2c8-0c82fd8c048b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTE3NzM1YS0yOTE4LTQwYmYtOTJmMS04NDkxYWY1YjhlNmIiLCJpYXQiOjE3ODIxMTMxNTEsImV4cCI6MTc4MjcxNzk1MX0.7mozwhltLh1HIShoX6CG3x2cKbhAZ_424BcXKw7AvZI	2026-06-29 07:25:51.57	t	e117735a-2918-40bf-92f1-8491af5b8e6b
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, "createdAt", "isActive", role) FROM stdin;
2ae939c0-70a9-423d-ac93-aae04581fe44	Umar	umar@gmail.com	$2b$10$/o50UOOmdKfvHsJ1w.lCYuz7YHrHeMv1tkCQdttUBYBzqDz6iWhPi	2026-05-10 20:28:28.787	t	user
0712f227-c70c-4714-afc2-15d13b1782e7	Umar	umar2@gmail.com	$2b$10$U80xAxDDkZ0j7BRBpsQ70.McASvg6P/yfV/VwdDolNPo4HDAxMzta	2026-05-10 20:30:54.956	t	user
9d05232c-77ec-4ee4-a574-8035e03f8590	Umar	umar4@gmail.com	$2b$10$RdBxJUV1VVsKsZdWO3kQ6Og82Yj8OMDPbh26qiJI2iWps6qY8E2ni	2026-05-10 20:44:57.086	t	user
59067773-7e62-4f2c-ad9a-04945c20a306	saved	saved@gmail.com	$2b$10$M1WeYUmkgD/Uu7JBgcG0e.hz8aP/338D6mDwKMpEmTUV.KCsi/SoC	2026-05-25 07:59:56.323	t	user
7fb84218-52b1-4727-a686-795905746874	saved	saved2@gmail.com	$2b$10$lBNUvaGtvmvXhh43fR1nbuCGhVfh1jo5PBNrHg15k3K6fXLjCb9f.	2026-05-25 08:00:55.094	t	user
5ef9db60-4a5c-49bf-9a05-fdeeaf606fe2	saved	saved3@gmail.com	$2b$10$MxCs/FOzTPvJA8dJNIZlYeE2Jby7PaNfXm/IIzxD0NnRSlwhBUJZO	2026-05-25 08:01:32.807	t	user
aee3e274-927d-4d62-be58-4f283d5263f1	saved	saved4@gmail.com	$2b$10$nCgARE6ZqSX/kyeYJ/b7oeLe1sN60Fva0XsOQLzFolO95clKdnsRu	2026-05-25 08:03:06.022	t	user
e117735a-2918-40bf-92f1-8491af5b8e6b	Admin	admin@gmail.com	$2b$10$2Si0dC6WshRFm4mFvsxH/O1nsttFegyxlITarIC78BYberwn6EBZW	2026-05-18 09:54:51.474	t	admin
\.


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 12, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: assetfolders assetfolders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assetfolders
    ADD CONSTRAINT assetfolders_pkey PRIMARY KEY ("assetId", "folderId");


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: assettags assettags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assettags
    ADD CONSTRAINT assettags_pkey PRIMARY KEY ("assetId", "tagId");


--
-- Name: collaborators collaborators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collaborators
    ADD CONSTRAINT collaborators_pkey PRIMARY KEY ("folderId", "userId");


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: assettags_tagId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assettags_tagId_idx" ON public.assettags USING btree ("tagId");


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tokens_token_key ON public.tokens USING btree (token);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: assetfolders assetfolders_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assetfolders
    ADD CONSTRAINT "assetfolders_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assetfolders assetfolders_folderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assetfolders
    ADD CONSTRAINT "assetfolders_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES public.folders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assets assets_mainFolder_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "assets_mainFolder_fkey" FOREIGN KEY ("mainFolder") REFERENCES public.folders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: assettags assettags_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assettags
    ADD CONSTRAINT "assettags_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assettags assettags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assettags
    ADD CONSTRAINT "assettags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: collaborators collaborators_folderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collaborators
    ADD CONSTRAINT "collaborators_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES public.folders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: collaborators collaborators_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collaborators
    ADD CONSTRAINT "collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: folders folders_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.folders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: folders folders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tokens tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 9JgDCvZxOrdrPRQdH6mgtX8gIM3jZSLCC5k6rmuSyrGjVy83Aa07d4sNIUiTkBg

