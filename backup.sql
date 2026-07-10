--
-- PostgreSQL database dump
--

\restrict SbcxuyNs9euHXI7krGoYBuvrcWjmvQdYCZGMaCqjgkQb7B44IvaybxL3u790bXu

-- Dumped from database version 15.4
-- Dumped by pg_dump version 18.0

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
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger;


--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger_data;


--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


--
-- Name: autoinc; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS autoinc WITH SCHEMA public;


--
-- Name: EXTENSION autoinc; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION autoinc IS 'functions for autoincrementing fields';


--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: cube; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS cube WITH SCHEMA public;


--
-- Name: EXTENSION cube; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION cube IS 'data type for multidimensional cubes';


--
-- Name: dblink; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA public;


--
-- Name: EXTENSION dblink; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION dblink IS 'connect to other PostgreSQL databases from within a database';


--
-- Name: dict_int; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dict_int WITH SCHEMA public;


--
-- Name: EXTENSION dict_int; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION dict_int IS 'text search dictionary template for integers';


--
-- Name: dict_xsyn; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dict_xsyn WITH SCHEMA public;


--
-- Name: EXTENSION dict_xsyn; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION dict_xsyn IS 'text search dictionary template for extended synonym processing';


--
-- Name: earthdistance; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS earthdistance WITH SCHEMA public;


--
-- Name: EXTENSION earthdistance; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION earthdistance IS 'calculate great-circle distances on the surface of the Earth';


--
-- Name: file_fdw; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS file_fdw WITH SCHEMA public;


--
-- Name: EXTENSION file_fdw; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION file_fdw IS 'foreign-data wrapper for flat file access';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: hstore; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public;


--
-- Name: EXTENSION hstore; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION hstore IS 'data type for storing sets of (key, value) pairs';


--
-- Name: insert_username; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS insert_username WITH SCHEMA public;


--
-- Name: EXTENSION insert_username; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION insert_username IS 'functions for tracking who changed a table';


--
-- Name: intagg; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS intagg WITH SCHEMA public;


--
-- Name: EXTENSION intagg; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION intagg IS 'integer aggregator and enumerator (obsolete)';


--
-- Name: intarray; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS intarray WITH SCHEMA public;


--
-- Name: EXTENSION intarray; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION intarray IS 'functions, operators, and index support for 1-D arrays of integers';


--
-- Name: isn; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS isn WITH SCHEMA public;


--
-- Name: EXTENSION isn; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION isn IS 'data types for international product numbering standards';


--
-- Name: lo; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS lo WITH SCHEMA public;


--
-- Name: EXTENSION lo; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION lo IS 'Large Object maintenance';


--
-- Name: ltree; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA public;


--
-- Name: EXTENSION ltree; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION ltree IS 'data type for hierarchical tree-like structures';


--
-- Name: moddatetime; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA public;


--
-- Name: EXTENSION moddatetime; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION moddatetime IS 'functions for tracking last modification time';


--
-- Name: pageinspect; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pageinspect WITH SCHEMA public;


--
-- Name: EXTENSION pageinspect; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pageinspect IS 'inspect the contents of database pages at a low level';


--
-- Name: pg_buffercache; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_buffercache WITH SCHEMA public;


--
-- Name: EXTENSION pg_buffercache; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_buffercache IS 'examine the shared buffer cache';


--
-- Name: pg_freespacemap; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_freespacemap WITH SCHEMA public;


--
-- Name: EXTENSION pg_freespacemap; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_freespacemap IS 'examine the free space map (FSM)';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgrowlocks; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgrowlocks WITH SCHEMA public;


--
-- Name: EXTENSION pgrowlocks; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgrowlocks IS 'show row-level locking information';


--
-- Name: pgstattuple; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgstattuple WITH SCHEMA public;


--
-- Name: EXTENSION pgstattuple; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgstattuple IS 'show tuple-level statistics';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_raster; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_raster WITH SCHEMA public;


--
-- Name: EXTENSION postgis_raster; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_raster IS 'PostGIS raster types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: refint; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS refint WITH SCHEMA public;


--
-- Name: EXTENSION refint; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION refint IS 'functions for implementing referential integrity (obsolete)';


--
-- Name: seg; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS seg WITH SCHEMA public;


--
-- Name: EXTENSION seg; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION seg IS 'data type for representing line segments or floating-point intervals';


--
-- Name: sslinfo; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS sslinfo WITH SCHEMA public;


--
-- Name: EXTENSION sslinfo; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION sslinfo IS 'information about SSL certificates';


--
-- Name: tablefunc; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS tablefunc WITH SCHEMA public;


--
-- Name: EXTENSION tablefunc; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION tablefunc IS 'functions that manipulate whole tables, including crosstab';


--
-- Name: tcn; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS tcn WITH SCHEMA public;


--
-- Name: EXTENSION tcn; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION tcn IS 'Triggered change notifications';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: xml2; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS xml2 WITH SCHEMA public;


--
-- Name: EXTENSION xml2; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION xml2 IS 'XPath querying and XSLT';


--
-- Name: enum_ai_chat_logs_ai_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_ai_chat_logs_ai_type AS ENUM (
    'rag',
    'chat',
    'quiz',
    'homework',
    'summary',
    'question_paper',
    'lesson_summary'
);


--
-- Name: enum_attendances_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_attendances_status AS ENUM (
    'present',
    'absent',
    'leave',
    'on_duty'
);


--
-- Name: enum_audit_logs_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_audit_logs_action AS ENUM (
    'approve',
    'reject'
);


--
-- Name: enum_audit_logs_entity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_audit_logs_entity_type AS ENUM (
    'student',
    'teacher',
    'parent'
);


--
-- Name: enum_feedbacks_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_feedbacks_category AS ENUM (
    'bug_report',
    'feature_request',
    'suggestion',
    'complaint',
    'appreciation'
);


--
-- Name: enum_feedbacks_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_feedbacks_status AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


--
-- Name: enum_game_session_players_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_game_session_players_status AS ENUM (
    'JOINED',
    'READY',
    'PLAYING',
    'DISCONNECTED',
    'FINISHED'
);


--
-- Name: enum_game_sessions_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_game_sessions_mode AS ENUM (
    'SINGLE',
    'MULTI'
);


--
-- Name: enum_game_sessions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_game_sessions_status AS ENUM (
    'LOBBY',
    'IN_PROGRESS',
    'FINISHED',
    'CANCELLED'
);


--
-- Name: enum_group_chat_members_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_group_chat_members_role AS ENUM (
    'teacher',
    'student'
);


--
-- Name: enum_group_chat_messages_message_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_group_chat_messages_message_type AS ENUM (
    'text',
    'image'
);


--
-- Name: enum_lost_found_items_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_lost_found_items_status AS ENUM (
    'OPEN',
    'CLOSED'
);


--
-- Name: enum_lost_found_items_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_lost_found_items_type AS ENUM (
    'lost',
    'found'
);


--
-- Name: enum_notification_acks_user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_notification_acks_user_role AS ENUM (
    'teacher',
    'student'
);


--
-- Name: enum_notifications_sender_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_notifications_sender_role AS ENUM (
    'school_admin',
    'teacher'
);


--
-- Name: enum_notifications_target_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_notifications_target_role AS ENUM (
    'teacher',
    'student',
    'all'
);


--
-- Name: enum_parents_approval_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_parents_approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_parents_relation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_parents_relation_type AS ENUM (
    'mother',
    'father',
    'guardian'
);


--
-- Name: enum_quizzes_difficulty; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_quizzes_difficulty AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD',
    'ADAPTIVE'
);


--
-- Name: enum_schools_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_schools_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'expired'
);


--
-- Name: enum_students_approval_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_students_approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_students_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_students_gender AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: enum_students_residential_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_students_residential_status AS ENUM (
    'dayscholar',
    'hosteler'
);


--
-- Name: enum_students_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_students_status AS ENUM (
    'ACTIVE',
    'TRANSFERRED',
    'DROPPED',
    'GRADUATED'
);


--
-- Name: enum_subjects_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_subjects_category AS ENUM (
    'theory',
    'practical',
    'both'
);


--
-- Name: enum_teachers_approval_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_teachers_approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_teachers_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_teachers_gender AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: enum_teachers_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_teachers_status AS ENUM (
    'ACTIVE',
    'RESIGNED',
    'RETIRED',
    'TERMINATED'
);


--
-- Name: enum_timetables_day_of_week; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_timetables_day_of_week AS ENUM (
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
);


--
-- Name: enum_token_policies_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_token_policies_role AS ENUM (
    'student',
    'teacher'
);


--
-- Name: enum_token_transactions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_token_transactions_type AS ENUM (
    'subscription_grant',
    'usage',
    'refund',
    'bonus',
    'admin_adjustment',
    'expiry'
);


--
-- Name: enum_transport_requests_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_transport_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_trips_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_trips_status AS ENUM (
    'active',
    'completed'
);


--
-- Name: enum_trips_trip_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_trips_trip_type AS ENUM (
    'pickup',
    'drop'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'super_admin',
    'school_admin',
    'teacher',
    'student',
    'driver'
);


--
-- Name: enum_voice_logs_purpose; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_voice_logs_purpose AS ENUM (
    'dictation',
    'question',
    'command',
    'revision',
    'general'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.academic_years (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_current boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: academic_years_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.academic_years_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: academic_years_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.academic_years_id_seq OWNED BY public.academic_years.id;


--
-- Name: ai_chat_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_chat_logs (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    user_query text NOT NULL,
    ai_response text NOT NULL,
    tokens_used integer DEFAULT 0 NOT NULL,
    model_used character varying(255) NOT NULL,
    ai_type public.enum_ai_chat_logs_ai_type DEFAULT 'chat'::public.enum_ai_chat_logs_ai_type NOT NULL,
    class_level character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: ai_chat_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_chat_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_chat_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_chat_logs_id_seq OWNED BY public.ai_chat_logs.id;


--
-- Name: attendances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendances (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    teacher_class_session_id bigint,
    class_id bigint NOT NULL,
    section_id bigint NOT NULL,
    student_id bigint NOT NULL,
    date date NOT NULL,
    status public.enum_attendances_status NOT NULL,
    marked_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    created_by bigint,
    updated_by bigint,
    academic_year_id bigint
);


--
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    entity_type public.enum_audit_logs_entity_type NOT NULL,
    entity_id bigint NOT NULL,
    action public.enum_audit_logs_action NOT NULL,
    remark text,
    performed_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    class_name character varying(255) NOT NULL,
    class_teacher_id bigint,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.classes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drivers (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    school_id bigint NOT NULL,
    license_number character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.drivers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.drivers_id_seq OWNED BY public.drivers.id;


--
-- Name: exam_masters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_masters (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: exam_masters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exam_masters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exam_masters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exam_masters_id_seq OWNED BY public.exam_masters.id;


--
-- Name: exam_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_subjects (
    id bigint NOT NULL,
    exam_id bigint NOT NULL,
    subject_id bigint NOT NULL,
    syllabus text,
    exam_date date NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: exam_subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exam_subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exam_subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exam_subjects_id_seq OWNED BY public.exam_subjects.id;


--
-- Name: exams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exams (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    class_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    exam_master_id bigint,
    is_locked boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    academic_year_id bigint
);


--
-- Name: exams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exams_id_seq OWNED BY public.exams.id;


--
-- Name: families; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.families (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    father_name character varying(255),
    mother_name character varying(255),
    guardian_phone character varying(255),
    address text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: families_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.families_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: families_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.families_id_seq OWNED BY public.families.id;


--
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedbacks (
    id bigint NOT NULL,
    school_id bigint,
    title character varying(255) NOT NULL,
    category public.enum_feedbacks_category NOT NULL,
    description text NOT NULL,
    screenshot_url text,
    user_id bigint NOT NULL,
    role character varying(255) NOT NULL,
    browser character varying(255),
    app_version character varying(255),
    status public.enum_feedbacks_status DEFAULT 'OPEN'::public.enum_feedbacks_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: feedbacks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.feedbacks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feedbacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.feedbacks_id_seq OWNED BY public.feedbacks.id;


--
-- Name: game_session_players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_session_players (
    id bigint NOT NULL,
    session_id bigint NOT NULL,
    user_id bigint NOT NULL,
    socket_id character varying(255),
    is_host boolean DEFAULT false,
    current_question_index integer DEFAULT 0 NOT NULL,
    status public.enum_game_session_players_status DEFAULT 'JOINED'::public.enum_game_session_players_status NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    joined_at timestamp with time zone,
    left_at timestamp with time zone,
    finished_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: game_session_players_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.game_session_players_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: game_session_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.game_session_players_id_seq OWNED BY public.game_session_players.id;


--
-- Name: game_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_sessions (
    id bigint NOT NULL,
    quiz_id bigint NOT NULL,
    mode public.enum_game_sessions_mode NOT NULL,
    room_code character varying(255),
    host_user_id bigint NOT NULL,
    max_players integer,
    total_time_ms integer NOT NULL,
    status public.enum_game_sessions_status DEFAULT 'LOBBY'::public.enum_game_sessions_status NOT NULL,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: game_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.game_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: game_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.game_sessions_id_seq OWNED BY public.game_sessions.id;


--
-- Name: group_chat_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_chat_members (
    id bigint NOT NULL,
    group_chat_id bigint NOT NULL,
    user_id bigint NOT NULL,
    role public.enum_group_chat_members_role NOT NULL,
    joined_at timestamp with time zone NOT NULL,
    left_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: group_chat_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_chat_members_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_chat_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_chat_members_id_seq OWNED BY public.group_chat_members.id;


--
-- Name: group_chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_chat_messages (
    id bigint NOT NULL,
    group_chat_id bigint NOT NULL,
    sender_user_id bigint NOT NULL,
    message_type public.enum_group_chat_messages_message_type NOT NULL,
    message_text text,
    image_url text,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: group_chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_chat_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_chat_messages_id_seq OWNED BY public.group_chat_messages.id;


--
-- Name: group_chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_chats (
    id bigint NOT NULL,
    teacher_id bigint NOT NULL,
    subject_id bigint NOT NULL,
    class_id bigint NOT NULL,
    section_id bigint NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: group_chats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_chats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_chats_id_seq OWNED BY public.group_chats.id;


--
-- Name: homework_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homework_submissions (
    id bigint NOT NULL,
    homework_id bigint NOT NULL,
    student_id bigint NOT NULL,
    is_completed boolean DEFAULT true NOT NULL,
    remark text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: homework_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.homework_submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: homework_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.homework_submissions_id_seq OWNED BY public.homework_submissions.id;


--
-- Name: homeworks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homeworks (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    class_id bigint NOT NULL,
    section_id bigint NOT NULL,
    teacher_assignment_id bigint NOT NULL,
    subject_id bigint NOT NULL,
    homework_date date NOT NULL,
    description text NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    academic_year_id bigint
);


--
-- Name: homeworks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.homeworks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: homeworks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.homeworks_id_seq OWNED BY public.homeworks.id;


--
-- Name: lost_found_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lost_found_items (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    type public.enum_lost_found_items_type NOT NULL,
    description text,
    date date NOT NULL,
    photos json DEFAULT '[]'::json,
    status public.enum_lost_found_items_status DEFAULT 'OPEN'::public.enum_lost_found_items_status NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: lost_found_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lost_found_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lost_found_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lost_found_items_id_seq OWNED BY public.lost_found_items.id;


--
-- Name: notification_acks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_acks (
    id bigint NOT NULL,
    notification_id bigint NOT NULL,
    user_id bigint NOT NULL,
    user_role public.enum_notification_acks_user_role NOT NULL,
    acknowledged_at timestamp with time zone NOT NULL
);


--
-- Name: notification_acks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_acks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_acks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_acks_id_seq OWNED BY public.notification_acks.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    sender_user_id bigint NOT NULL,
    sender_role public.enum_notifications_sender_role NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    target_role public.enum_notifications_target_role NOT NULL,
    class_id bigint,
    section_id bigint,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: parents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parents (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    student_id bigint NOT NULL,
    approval_status public.enum_parents_approval_status DEFAULT 'pending'::public.enum_parents_approval_status NOT NULL,
    approved_by bigint,
    approved_at timestamp with time zone,
    relation_type public.enum_parents_relation_type NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: parents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parents_id_seq OWNED BY public.parents.id;


--
-- Name: player_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_answers (
    id bigint NOT NULL,
    session_player_id bigint NOT NULL,
    question_id bigint NOT NULL,
    selected_option_index integer NOT NULL,
    is_correct boolean NOT NULL,
    time_taken_ms integer,
    answered_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: player_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.player_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: player_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.player_answers_id_seq OWNED BY public.player_answers.id;


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_questions (
    id bigint NOT NULL,
    quiz_id bigint NOT NULL,
    order_index integer NOT NULL,
    question_text text NOT NULL,
    options jsonb NOT NULL,
    correct_option_index integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quiz_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quiz_questions_id_seq OWNED BY public.quiz_questions.id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quizzes (
    id bigint NOT NULL,
    owner_user_id bigint,
    topic character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    difficulty public.enum_quizzes_difficulty NOT NULL,
    num_questions integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quizzes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- Name: report_card_marks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_card_marks (
    id bigint NOT NULL,
    report_card_id bigint NOT NULL,
    subject_id bigint NOT NULL,
    marks_obtained double precision NOT NULL,
    max_marks double precision NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: report_card_marks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.report_card_marks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_card_marks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.report_card_marks_id_seq OWNED BY public.report_card_marks.id;


--
-- Name: report_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_cards (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    class_id bigint NOT NULL,
    exam_id bigint NOT NULL,
    school_id bigint NOT NULL,
    remarks text,
    published_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    academic_year_id bigint
);


--
-- Name: report_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.report_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.report_cards_id_seq OWNED BY public.report_cards.id;


--
-- Name: schools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schools (
    id bigint NOT NULL,
    school_name character varying(255) NOT NULL,
    school_code character varying(255) NOT NULL,
    cbse_affiliation_no character varying(255),
    address text,
    city character varying(255),
    state character varying(255),
    zip character varying(255),
    contact_phone character varying(255),
    logo_url text,
    email character varying(255),
    status public.enum_schools_status DEFAULT 'pending'::public.enum_schools_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schools_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
-- Name: sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sections (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    class_id bigint NOT NULL,
    class_teacher_id bigint,
    name character varying(10) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sections_id_seq OWNED BY public.sections.id;


--
-- Name: student_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_enrollments (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    academic_year_id bigint NOT NULL,
    class_id bigint NOT NULL,
    section_id bigint NOT NULL,
    roll_no integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: student_enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_enrollments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_enrollments_id_seq OWNED BY public.student_enrollments.id;


--
-- Name: student_transports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_transports (
    student_id bigint NOT NULL,
    school_id bigint NOT NULL,
    vehicle_id bigint NOT NULL,
    pickup_point character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    school_id bigint NOT NULL,
    class_id bigint NOT NULL,
    section_id bigint,
    roll_no integer,
    admission_no character varying(255),
    dob date,
    gender public.enum_students_gender,
    father_name character varying(255),
    mother_name character varying(255),
    guardian_name character varying(255),
    address text,
    blood_group character varying(255),
    aadhar_no character varying(255),
    father_occupation character varying(255),
    mother_occupation character varying(255),
    family_income numeric(10,2),
    guardian_occupation character varying(255),
    emergency_contact character varying(255),
    residential_status public.enum_students_residential_status DEFAULT 'dayscholar'::public.enum_students_residential_status,
    is_active boolean DEFAULT true NOT NULL,
    approval_status public.enum_students_approval_status DEFAULT 'pending'::public.enum_students_approval_status NOT NULL,
    approved_by bigint,
    rejection_reason text,
    approved_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    family_id bigint,
    status character varying(50) DEFAULT 'ACTIVE'::character varying
);


--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.students_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255),
    category public.enum_subjects_category DEFAULT 'theory'::public.enum_subjects_category NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: teacher_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_assignments (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    teacher_id bigint NOT NULL,
    class_id bigint NOT NULL,
    section_id bigint NOT NULL,
    subject_id bigint,
    is_active boolean DEFAULT true,
    is_class_teacher boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: teacher_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_assignments_id_seq OWNED BY public.teacher_assignments.id;


--
-- Name: teacher_class_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_class_sessions (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    teacher_assignment_id bigint NOT NULL,
    teacher_id bigint NOT NULL,
    class_id bigint NOT NULL,
    section_id bigint NOT NULL,
    timetable_id bigint,
    started_at timestamp with time zone NOT NULL,
    ended_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: teacher_class_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teacher_class_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teacher_class_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teacher_class_sessions_id_seq OWNED BY public.teacher_class_sessions.id;


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teachers (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    school_id bigint NOT NULL,
    employee_id character varying(255) NOT NULL,
    gender public.enum_teachers_gender,
    designation character varying(255),
    qualification character varying(255),
    joining_date date NOT NULL,
    experience integer,
    approval_status public.enum_teachers_approval_status DEFAULT 'pending'::public.enum_teachers_approval_status NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    approved_by bigint,
    rejection_reason text,
    approved_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying
);


--
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teachers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- Name: timetables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timetables (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    class_id bigint NOT NULL,
    section_id bigint NOT NULL,
    day_of_week public.enum_timetables_day_of_week NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    teacher_assignment_id bigint,
    title character varying(255),
    is_break boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    academic_year_id bigint
);


--
-- Name: timetables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.timetables_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: timetables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.timetables_id_seq OWNED BY public.timetables.id;


--
-- Name: token_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_accounts (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: token_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.token_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: token_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.token_accounts_id_seq OWNED BY public.token_accounts.id;


--
-- Name: token_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_policies (
    id bigint NOT NULL,
    role public.enum_token_policies_role NOT NULL,
    monthly_tokens integer DEFAULT 0 NOT NULL,
    updated_by bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: token_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.token_policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: token_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.token_policies_id_seq OWNED BY public.token_policies.id;


--
-- Name: token_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_transactions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    type public.enum_token_transactions_type NOT NULL,
    change integer NOT NULL,
    balance_before integer NOT NULL,
    balance_after integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: token_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.token_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: token_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.token_transactions_id_seq OWNED BY public.token_transactions.id;


--
-- Name: transport_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transport_requests (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    student_id bigint NOT NULL,
    current_vehicle_id bigint,
    requested_vehicle_id bigint NOT NULL,
    pickup_point character varying(255),
    status public.enum_transport_requests_status DEFAULT 'pending'::public.enum_transport_requests_status NOT NULL,
    approved_by bigint,
    rejection_reason text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: transport_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transport_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transport_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transport_requests_id_seq OWNED BY public.transport_requests.id;


--
-- Name: trip_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trip_locations (
    id bigint NOT NULL,
    trip_id bigint NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    speed double precision,
    heading double precision,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: trip_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trip_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trip_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trip_locations_id_seq OWNED BY public.trip_locations.id;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trips (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    driver_id bigint NOT NULL,
    vehicle_id bigint NOT NULL,
    trip_type public.enum_trips_trip_type NOT NULL,
    status public.enum_trips_status DEFAULT 'active'::public.enum_trips_status NOT NULL,
    started_at timestamp with time zone NOT NULL,
    ended_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trips_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    school_id bigint,
    role public.enum_users_role NOT NULL,
    email character varying(255),
    phone character varying(255),
    password character varying(100) NOT NULL,
    first_login boolean DEFAULT true NOT NULL,
    username character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    refresh_token text,
    avatar_url text,
    last_login timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    vehicle_number character varying(255) NOT NULL,
    vehicle_name character varying(255) NOT NULL,
    capacity integer NOT NULL,
    driver_id bigint,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: voice_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_logs (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    purpose public.enum_voice_logs_purpose DEFAULT 'general'::public.enum_voice_logs_purpose NOT NULL,
    text text,
    tokens_used integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: voice_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voice_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voice_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voice_logs_id_seq OWNED BY public.voice_logs.id;


--
-- Name: whatsapp_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_logs (
    id bigint NOT NULL,
    school_id bigint,
    status character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    message text NOT NULL,
    response text,
    error text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.whatsapp_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.whatsapp_logs_id_seq OWNED BY public.whatsapp_logs.id;


--
-- Name: academic_years id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years ALTER COLUMN id SET DEFAULT nextval('public.academic_years_id_seq'::regclass);


--
-- Name: ai_chat_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_logs ALTER COLUMN id SET DEFAULT nextval('public.ai_chat_logs_id_seq'::regclass);


--
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- Name: drivers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers ALTER COLUMN id SET DEFAULT nextval('public.drivers_id_seq'::regclass);


--
-- Name: exam_masters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_masters ALTER COLUMN id SET DEFAULT nextval('public.exam_masters_id_seq'::regclass);


--
-- Name: exam_subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_subjects ALTER COLUMN id SET DEFAULT nextval('public.exam_subjects_id_seq'::regclass);


--
-- Name: exams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams ALTER COLUMN id SET DEFAULT nextval('public.exams_id_seq'::regclass);


--
-- Name: families id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.families ALTER COLUMN id SET DEFAULT nextval('public.families_id_seq'::regclass);


--
-- Name: feedbacks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks ALTER COLUMN id SET DEFAULT nextval('public.feedbacks_id_seq'::regclass);


--
-- Name: game_session_players id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_session_players ALTER COLUMN id SET DEFAULT nextval('public.game_session_players_id_seq'::regclass);


--
-- Name: game_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_sessions ALTER COLUMN id SET DEFAULT nextval('public.game_sessions_id_seq'::regclass);


--
-- Name: group_chat_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_members ALTER COLUMN id SET DEFAULT nextval('public.group_chat_members_id_seq'::regclass);


--
-- Name: group_chat_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_messages ALTER COLUMN id SET DEFAULT nextval('public.group_chat_messages_id_seq'::regclass);


--
-- Name: group_chats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chats ALTER COLUMN id SET DEFAULT nextval('public.group_chats_id_seq'::regclass);


--
-- Name: homework_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions ALTER COLUMN id SET DEFAULT nextval('public.homework_submissions_id_seq'::regclass);


--
-- Name: homeworks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks ALTER COLUMN id SET DEFAULT nextval('public.homeworks_id_seq'::regclass);


--
-- Name: lost_found_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lost_found_items ALTER COLUMN id SET DEFAULT nextval('public.lost_found_items_id_seq'::regclass);


--
-- Name: notification_acks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_acks ALTER COLUMN id SET DEFAULT nextval('public.notification_acks_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: parents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parents ALTER COLUMN id SET DEFAULT nextval('public.parents_id_seq'::regclass);


--
-- Name: player_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_answers ALTER COLUMN id SET DEFAULT nextval('public.player_answers_id_seq'::regclass);


--
-- Name: quiz_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN id SET DEFAULT nextval('public.quiz_questions_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- Name: report_card_marks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_marks ALTER COLUMN id SET DEFAULT nextval('public.report_card_marks_id_seq'::regclass);


--
-- Name: report_cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards ALTER COLUMN id SET DEFAULT nextval('public.report_cards_id_seq'::regclass);


--
-- Name: schools id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
-- Name: sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections ALTER COLUMN id SET DEFAULT nextval('public.sections_id_seq'::regclass);


--
-- Name: student_enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments ALTER COLUMN id SET DEFAULT nextval('public.student_enrollments_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: teacher_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments ALTER COLUMN id SET DEFAULT nextval('public.teacher_assignments_id_seq'::regclass);


--
-- Name: teacher_class_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_sessions ALTER COLUMN id SET DEFAULT nextval('public.teacher_class_sessions_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Name: timetables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables ALTER COLUMN id SET DEFAULT nextval('public.timetables_id_seq'::regclass);


--
-- Name: token_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_accounts ALTER COLUMN id SET DEFAULT nextval('public.token_accounts_id_seq'::regclass);


--
-- Name: token_policies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_policies ALTER COLUMN id SET DEFAULT nextval('public.token_policies_id_seq'::regclass);


--
-- Name: token_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_transactions ALTER COLUMN id SET DEFAULT nextval('public.token_transactions_id_seq'::regclass);


--
-- Name: transport_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport_requests ALTER COLUMN id SET DEFAULT nextval('public.transport_requests_id_seq'::regclass);


--
-- Name: trip_locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_locations ALTER COLUMN id SET DEFAULT nextval('public.trip_locations_id_seq'::regclass);


--
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: voice_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_logs ALTER COLUMN id SET DEFAULT nextval('public.voice_logs_id_seq'::regclass);


--
-- Name: whatsapp_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_logs ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_logs_id_seq'::regclass);


--
-- Data for Name: academic_years; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.academic_years (id, school_id, name, start_date, end_date, is_current, created_at, updated_at) FROM stdin;
1	1	2026-2027	2026-06-01	2027-05-31	t	2026-07-07 13:31:12.025398+00	2026-07-07 13:31:12.025398+00
\.


--
-- Data for Name: ai_chat_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_chat_logs (id, user_id, user_query, ai_response, tokens_used, model_used, ai_type, class_level, created_at, updated_at) FROM stdin;
1	3	{"classLevel":"6","chapter":"grammar","marks":50}	Here is a CBSE-style question paper for Class 6 General (Grammar), following your specifications:\n\n---\n\n**CENTRAL BOARD OF SECONDARY EDUCATION**\n**SAMPLE QUESTION PAPER**\n\n**CLASS: VI**\n**SUBJECT: GENERAL (GRAMMAR)**\n**TIME ALLOWED:** 2 Hours\n**MAXIMUM MARKS:** 50\n\n**General Instructions:**\n1.  This paper consists of three Sections: A, B, and C.\n2.  All questions are compulsory.\n3.  Marks are indicated against each question.\n4.  Read the questions carefully before answering.\n\n---\n\n**SECTION A: MULTIPLE CHOICE QUESTIONS (MCQs) (15 Marks)**\n\n**(Each question carries 1 mark)**\n\n**Choose the correct option for each question.**\n\n1.  Which of the following is a Noun?\n    a) happy\n    b) run\n    c) book\n    d) quickly\n\n2.  Identify the Pronoun in the following sentence: "She is reading a story."\n    a) She\n    b) is\n    c) reading\n    d) story\n\n3.  Which word describes a noun?\n    a) Verb\n    b) Adjective\n    c) Adverb\n    d) Pronoun\n\n4.  "Big", "small", "tall" are examples of:\n    a) Verbs\n    b) Adverbs\n    c) Adjectives\n    d) Nouns\n\n5.  The opposite of "fast" is:\n    a) slow\n    b) quick\n    c) rapid\n    d) speedy\n\n6.  A word that shows action is called a:\n    a) Noun\n    b) Verb\n    c) Adjective\n    d) Preposition\n\n7.  Identify the Verb in the sentence: "The cat slept on the mat."\n    a) The\n    b) cat\n    c) slept\n    d) mat\n\n8.  Which of the following is a Singular Noun?\n    a) children\n    b) mice\n    c) box\n    d) leaves\n\n9.  The word "beautifully" is a:\n    a) Noun\n    b) Verb\n    c) Adjective\n    d) Adverb\n\n10. Which word tells us *how*, *when*, or *where* an action is done?\n    a) Noun\n    b) Pronoun\n    c) Adverb\n    d) Conjunction\n\n11. The sentence "Ram is playing cricket" is in which tense?\n    a) Past Tense\n    b) Present Tense\n    c) Future Tense\n    d) None of the above\n\n12. Which of the following is a Plural Noun?\n    a) apple\n    b) tree\n    c) benches\n    d) flower\n\n13. The word "and" is a:\n    a) Preposition\n    b) Conjunction\n    c) Interjection\n    d) Verb\n\n14. Choose the correct Article for the blank: "I saw ______ elephant yesterday."\n    a) a\n    b) an\n    c) the\n    d) no article\n\n15. Identify the Adjective in the sentence: "The blue car is fast."\n    a) The\n    b) blue\n    c) car\n    d) is\n\n---\n\n**SECTION B: SHORT ANSWER QUESTIONS (20 Marks)**\n\n**(Answer all questions. Each question carries 2 marks.)**\n\n16. Define Noun and give two examples.\n17. Write the plural form of the following nouns:\n    a) child\n    b) box\n18. Identify the Pronoun and the Verb in the sentence: "He gave her a gift."\n19. Rewrite the following sentence in the Past Tense: "They are going to the park."\n20. Fill in the blank with a suitable Adjective: "The _________ boy helped the old lady."\n21. Identify the Adverb in the sentence: "The dog barked loudly."\n22. Underline the Preposition in the following sentence: "The book is on the table."\n23. Combine the following sentences using the conjunction "but": "She is tired. She wants to play."\n24. Fill in the blank with the correct Article (a/an/the): "She bought ______ new book."\n25. Give one example of an Interjection.\n\n---\n\n**SECTION C: LONG ANSWER QUESTIONS (15 Marks)**\n\n**(Answer all questions. Each question carries 5 marks.)**\n\n26. Read the following passage and answer the questions below:\n\n    "Riya is a bright student. She always wakes up early in the morning. Today, she finished her homework quickly. Her mother is cooking delicious food in the kitchen. Riya will help her later."\n\n    a) Identify two Nouns from the passage.\n    b) Identify one Pronoun from the passage.\n    c) Identify one Verb from the passage.\n    d) Identify one Adverb from the passage.\n    e) Rewrite the sentence "Her mother is cooking delicious food in the kitchen" in the Future Tense.\n\n27. **(Choose ONE of the following)**\n\n    **(a) Rewrite the following sentences, correcting the grammatical errors:**\n    i)  The dogs barks loudly.\n    ii) She go to school yesterday.\n    iii) He is more taller than me.\n    iv) They is playing football.\n    v) I seen him last week.\n\n    **(b) Write a short paragraph (4-5 sentences) about your favourite game. Use at least three different types of words you have learned (e.g., Noun, Verb, Adjective, Adverb).**\n\n28. **(Choose ONE of the following)**\n\n    **(a) Fill in the blanks with appropriate words and identify the part of speech of the underlined word:**\n    i)  The cat slept _______ the mat. (Underline: the)\n    ii) My friend is very _______. (Choose an Adjective)\n    iii) The children shouted _______. (Choose an Adverb)\n    iv) She likes to read ______ play. (Choose a Conjunction)\n    v)  _______! That was a great shot! (Choose an Interjection)\n\n    **(b) Define and give examples of the following Parts of Speech:**\n    i)  Adjective\n    ii) Verb\n    iii) Conjunction\n\n---\n**END OF PAPER**\n\n---\n\n**Answer Key (for Teacher's use - not to be provided to students)**\n\n**SECTION A: MCQs (15 Marks)**\n1.  c) book\n2.  a) She\n3.  b) Adjective\n4.  c) Adjectives\n5.  a) slow\n6.  b) Verb\n7.  c) slept\n8.  c) box\n9.  d) Adverb\n10. c) Adverb\n11. b) Present Tense\n12. c) benches\n13. b) Conjunction\n14. b) an\n15. b) blue\n\n**SECTION B: SHORT ANSWER QUESTIONS (20 Marks)**\n16. **Noun:** A noun is a word that names a person, place, thing, or idea. (1 mark for definition, 1 mark for 2 examples like: *boy, city, chair, happiness*)\n17. a) children (1 mark) b) boxes (1 mark)\n18. Pronoun: He (1 mark), Verb: gave (1 mark)\n19. They were going to the park. (2 marks)\n20. (Example) *kind* / *helpful* / *smart* / *tall* / *young* (Any suitable adjective gets 2 marks)\n21. Adverb: loudly (2 marks)\n22. The book is **on** the table. (Preposition: on - 2 marks)\n23. She is tired, but she wants to play. (2 marks)\n24. a (2 marks)\n25. (Example) Wow! / Ouch! / Hurray! (Any suitable interjection gets 2 marks)\n\n**SECTION C: LONG ANSWER QUESTIONS (15 Marks)**\n\n26. **(5 Marks)**\n    a) Two Nouns: Riya, student, morning, homework, mother, food, kitchen (any two - 1 mark each = 2 marks)\n    b) One Pronoun: She, her (any one - 1 mark)\n    c) One Verb: wakes, finished, cooking, will help (any one - 1 mark)\n    d) One Adverb: early, quickly, later (any one - 1 mark)\n    e) Her mother will cook delicious food in the kitchen. (1 mark)\n\n27. **(Choose ONE - 5 Marks)**\n\n    **(a) Corrected Sentences:**\n    i)  The dog barks loudly. (Or: The dogs bark loudly.) (1 mark)\n    ii) She went to school yesterday. (1 mark)\n    iii) He is taller than me. (1 mark)\n    iv) They are playing football. (1 mark)\n    v)  I saw him last week. (1 mark)\n\n    **(b) Paragraph on Favourite Game:** (Example answer for assessment)\n    My favourite game is cricket. (Noun: cricket) I play it with my friends in the park. (Verb: play, Noun: friends, park) It is a very exciting game. (Adjective: exciting) We bat and bowl really well. (Verb: bat, bowl, Adverb: really) I love scoring runs. (Verb: scoring, Noun: runs)\n    (Award marks based on sentence structure, relevant vocabulary, and correct use of at least 3 different word types. 5 marks total.)\n\n28. **(Choose ONE - 5 Marks)**\n\n    **(a) Fill in the blanks and identify Part of Speech:**\n    i)  The cat slept **on** the mat. (Part of Speech: Preposition - 1 mark for blank, 1 mark for identification)\n    ii) My friend is very **kind**. (Adjective - 1 mark for blank, 1 mark for identification)\n    iii) The children shouted **loudly**. (Adverb - 1 mark for blank, 1 mark for identification)\n    iv) She likes to read **or** play. (Conjunction - 1 mark for blank, 1 mark for identification)\n    v)  **Wow**! That was a great shot! (Interjection - 1 mark for blank, 1 mark for identification)\n    *(Note: For each blank and identification, award marks appropriately based on the chosen word and its correct classification. If a student fills the blank correctly but misidentifies the part of speech, partial credit can be given.)*\n\n    **(b) Definitions and Examples:**\n    i)  **Adjective:** A word that describes a noun or pronoun. Example: *beautiful, happy, big* (1 mark definition, 1 mark example)\n    ii) **Verb:** A word that shows action or a state of being. Example: *run, eat, is, was* (1 mark definition, 1 mark example)\n    iii) **Conjunction:** A word that joins words, phrases, or sentences. Example: *and, but, or* (1 mark definition, 1 mark example)	2592	gemini-2.5-flash-lite	question_paper	6	2026-07-04 05:32:17.58+00	2026-07-04 05:32:17.58+00
2	13	hi	Hi there! How can I help you today? 😊	46	gemini-2.5-flash-lite	chat	6	2026-07-04 07:12:11.961+00	2026-07-04 07:12:11.961+00
3	13	can you explain me 5+5 in tamil	Sure! In Tamil, we say "Ainthum ainthum paththu".\n\n"Ainthu" (ஐந்து) means five.\n"Paththu" (பத்து) means ten.\n\nSo, "Ainthum ainthum paththu" literally means "five and five are ten".	108	gemini-2.5-flash-lite	chat	6	2026-07-04 07:13:00.949+00	2026-07-04 07:13:00.949+00
4	13	can you explain me gravity in tamil	நிச்சயமாக, நான் புவியீர்ப்பு விசையை தமிழில் உங்களுக்கு எளிமையாக விளக்குகிறேன்!\n\n**புவியீர்ப்பு விசை (Gravity)** என்பது ஒரு சக்தி. இது இரண்டு பொருட்கள் ஒன்றை ஒன்று ஈர்க்கும் சக்தி.\n\n*   **பூமி நம்மை ஈர்க்கிறது:** பூமி ஒரு பெரிய பொருள், அதனால் அது நம்மை தன்னை நோக்கி ஈர்க்கிறது. இதனால்தான் நாம் தரையில் நிற்கிறோம், மேலே பறந்து போவதில்லை.\n*   **பொருட்களும் ஈர்க்கும்:** நாம் அனைவரும், மேஜை, நாற்காலி, புத்தகங்கள் என எல்லாமே சிறிய அளவில் ஒன்றை ஒன்று ஈர்க்கும். ஆனால், பூமி மிகவும் பெரியதாக இருப்பதால், அதன் ஈர்ப்பு விசைதான் நமக்கு அதிகமாகத் தெரிகிறது.\n\n**எப்படி வேலை செய்கிறது?**\n\n*   **பொருளின் அளவு:** ஒரு பொருள் எவ்வளவு பெரியதோ (அதாவது, அதன் நிறை - mass - அதிகமாக இருக்கிறதோ), அவ்வளவு அதிகமாக அதன் புவியீர்ப்பு விசை இருக்கும். அதனால்தான் பெரிய கிரகங்கள் (பூமி, சந்திரன், சூரியன்) சிறிய பொருட்களை விட அதிகமாக ஈர்க்கின்றன.\n*   **தூரம்:** இரண்டு பொருட்களுக்கு இடையே தூரம் அதிகமாக அதிகமாக, அவற்றின் ஈர்ப்பு விசை குறையும். தூரம் குறையும்போது, ஈர்ப்பு விசை அதிகமாகும்.\n\n**சில உதாரணங்கள்:**\n\n*   நீங்கள் ஒரு பந்தை மேலே எறிந்தால், அது மீண்டும் கீழே வருகிறது அல்லவா? அது புவியீர்ப்பு விசையால்தான்.\n*   சந்திரன் பூமியைச் சுற்றி வருகிறது. இதுவும் புவியீர்ப்பு விசையால்தான்.\n*   சூரியன் நம்முடைய சூரிய குடும்பத்தில் உள்ள அனைத்து கிரகங்களையும் தன் பக்கம் ஈர்த்து, அவை சூரியனைச் சுற்றி வர வைக்கிறது.\n\nசுருக்கமாகச் சொன்னால், **புவியீர்ப்பு விசை என்பது பொருட்களை ஒன்றை ஒன்று ஈர்க்கும் ஒரு கண்ணுக்குத் தெரியாத சக்தி**. இது நாம் தரையில் நிற்கவும், கிரகங்கள் சுற்றுப்பாதையில் செல்லவும் உதவுகிறது.\n\nஉங்களுக்கு இது புரிந்ததா? வேறு ஏதேனும் கேள்விகள் இருந்தால் கேளுங்கள்!	452	gemini-2.5-flash-lite	chat	6	2026-07-04 08:16:33.746+00	2026-07-04 08:16:33.746+00
5	3	{"classLevel":"6","chapter":"Animals","marks":20}	## CBSE Sample Question Paper\n\n**Subject:** General Science\n**Class:** VI\n**Chapter:** Animals\n**Total Marks:** 20\n**Time:** 1 Hour\n\n---\n\n**General Instructions:**\n\n*   All questions are compulsory.\n*   The question paper consists of three sections: A, B, and C.\n*   **Section A** contains 5 multiple-choice questions, each carrying 1 mark.\n*   **Section B** contains 5 short answer questions, each carrying 2 marks.\n*   **Section C** contains 2 long answer questions, each carrying 5 marks.\n*   Draw neat and labelled diagrams where necessary.\n\n---\n\n**Section A: Multiple Choice Questions (5 x 1 = 5 Marks)**\n\n*Choose the correct option for each question.*\n\n1.  Which of the following is an omnivorous animal?\n    (a) Lion\n    (b) Cow\n    (c) Bear\n    (d) Deer\n\n2.  The process by which a butterfly develops from a larva is called:\n    (a) Germination\n    (b) Respiration\n    (c) Metamorphosis\n    (d) Photosynthesis\n\n3.  Which of these animals has a segmented body?\n    (a) Fish\n    (b) Snake\n    (c) Earthworm\n    (d) Frog\n\n4.  Birds breathe with the help of:\n    (a) Gills\n    (b) Lungs\n    (c) Skin\n    (d) Trachea\n\n5.  Which of the following is a marsupial?\n    (a) Elephant\n    (b) Kangaroo\n    (c) Dolphin\n    (d) Penguin\n\n---\n\n**Section B: Short Answer Questions (5 x 2 = 10 Marks)**\n\n*Answer the following questions in brief.*\n\n1.  Differentiate between herbivores and carnivores, giving one example of each.\n\n2.  What are the common characteristics of animals that can fly?\n\n3.  Explain why amphibians can live both on land and in water.\n\n4.  Define the term 'habitat'. Give two examples of animal habitats.\n\n5.  Describe any two adaptations found in desert animals that help them survive in their environment.\n\n---\n\n**Section C: Long Answer Questions (2 x 5 = 10 Marks)**\n\n*Answer the following questions in detail.*\n\n1.  Describe the life cycle of a frog. You may draw a diagram to illustrate the different stages.\n    *(Marks: 5)*\n\n2.  Discuss the different types of teeth found in mammals and their functions. Give examples of animals that have specific types of teeth suited for their diet.\n    *(Marks: 5)*\n\n---\n\n**End of Paper**	679	gemini-2.5-flash-lite	question_paper	6	2026-07-07 05:11:47.285+00	2026-07-07 05:11:47.285+00
6	3	{"classLevel":"6","topic":"Tell about the animals"}	## Class 6: General Subject - Tell About the Animals\n\n**Lesson Duration:** 30-40 Minutes\n\n**Learning Objective:** Students will be able to identify and describe common characteristics of different animal groups.\n\n---\n\n### **Lesson Summary**\n\n**I. Introduction (5 minutes)**\n\n*   **Hook:** "Imagine you're going on a safari! What amazing creatures might you see? Today, we're going to become animal experts and learn about different kinds of animals!"\n*   **Briefly introduce the topic:** We're going to talk about animals and what makes them special.\n\n**II. Key Concepts & Activities (20-25 minutes)**\n\n*   **What is an Animal? (2 minutes)**\n    *   **Key Concept:** Animals are living things that can move, eat, and grow. They are different from plants.\n    *   **Easy Explanation:** Animals are alive! They don't grow from seeds like plants. They need to eat food to get energy to move and grow.\n\n*   **Exploring Different Animal Groups (15 minutes)**\n    *   **Key Concept 1: Mammals:** Warm-blooded, have fur or hair, feed milk to their young.\n        *   **Examples:** Dogs, cats, lions, elephants, humans!\n        *   **Activity:** Show pictures of mammals. Ask students to point out the fur/hair and think about what they eat (meat or plants). "Can you think of any mammals that swim?" (Whales, dolphins)\n    *   **Key Concept 2: Birds:** Have feathers, wings, most can fly, lay eggs.\n        *   **Examples:** Eagles, penguins, sparrows, parrots.\n        *   **Activity:** Show pictures of birds. Discuss their feathers and wings. "What's different about a penguin's wings?" (They are for swimming, not flying). "What do birds eat?" (Seeds, insects, fish).\n    *   **Key Concept 3: Reptiles:** Cold-blooded, have scales, lay eggs (usually).\n        *   **Examples:** Snakes, lizards, turtles, crocodiles.\n        *   **Activity:** Show pictures of reptiles. Talk about their scaly skin. "Do reptiles make their own food like plants? No! They need to eat other animals or plants." "How do reptiles stay warm?" (They bask in the sun).\n    *   **Key Concept 4: Fish:** Live in water, have scales and fins, breathe with gills.\n        *   **Examples:** Sharks, goldfish, salmon.\n        *   **Activity:** Show pictures of fish. Emphasize breathing with gills. "How do fish move around?" (Using their fins).\n    *   **Key Concept 5: Amphibians:** Live part of their life in water and part on land, have smooth, moist skin, lay eggs.\n        *   **Examples:** Frogs, toads, salamanders.\n        *   **Activity:** Show pictures of amphibians. Explain their "two lives" – water and land. "What does a baby frog look like?" (Tadpole – lives only in water).\n\n*   **Animal Superpowers (3 minutes)**\n    *   **Key Concept:** Different animals have special abilities that help them survive.\n    *   **Easy Explanation:** Think about what makes each animal special. A lion is strong, a bird can fly, a fish can breathe underwater! These are their "superpowers."\n    *   **Activity:** Quick "Guess the Superpower" game. "I have sharp claws for climbing and hunting. What animal am I?" (Tiger/Lion) "I have very long legs to run fast. What animal am I?" (Ostrich/Giraffe).\n\n**III. Conclusion & Wrap-up (5-10 minutes)**\n\n*   **Review:** "So, we learned about different kinds of animals today! Can you name one group we talked about?" (Call on students). "What is one thing that makes mammals special?"\n*   **Quick Quiz/Game:** "Which animal group has feathers and can fly?" (Birds) "Which animal group lives in water and breathes with gills?" (Fish)\n*   **Look Ahead:** "Next time, we'll explore even more amazing animals and their habitats!"\n*   **Take-home thought:** "When you see an animal this week, try to think about what group it belongs to and what makes it special!"\n\n---\n\n**Materials Needed:**\n\n*   Pictures/flashcards of various animals representing different groups (mammals, birds, reptiles, fish, amphibians).\n*   Whiteboard or chart paper.\n*   Markers.	1066	gemini-2.5-flash-lite	lesson_summary	6	2026-07-07 05:12:47.879+00	2026-07-07 05:12:47.879+00
7	13	Hi	Hi there! I'm here to help. What can I help you with today? 😊	54	gemini-2.5-flash-lite	chat	6	2026-07-07 05:15:18.592+00	2026-07-07 05:15:18.592+00
8	13	I want to know about the animals	Hey there! It's awesome you're curious about animals! They are some of the most amazing creatures on our planet.\n\nThink of animals as living things that can **move** on their own and **eat** other things to get energy. That's a big difference from plants, right? Plants mostly stay put and make their own food from sunlight!\n\nAnimals come in SO many shapes, sizes, and forms. It's like a giant, incredible collection! We can put them into different groups to help us understand them better.\n\nHere are some of the main ways we can think about animals:\n\n*   **Backbone or No Backbone?**\n    *   **Vertebrates:** These are animals that **have a backbone** (like us humans, dogs, cats, fish, birds, and snakes!). Their backbone helps support their body.\n    *   **Invertebrates:** These are animals that **do NOT have a backbone**. This is actually the biggest group of animals! Think of insects (like ants and butterflies), spiders, worms, jellyfish, and snails. They have other ways to support their bodies, like a hard outer shell or just being squishy!\n\n*   **Where do they live?**\n    *   **Land Animals (Terrestrial):** They live on the ground, like lions, elephants, rabbits, and squirrels.\n    *   **Water Animals (Aquatic):** They live in water, like fish, whales, dolphins, and octopuses.\n    *   **Air Animals (Aerial):** Birds and bats are great examples – they spend a lot of time flying!\n\n*   **What do they eat?**\n    *   **Herbivores:** These animals **only eat plants**. Think of cows, sheep, and deer.\n    *   **Carnivores:** These animals **only eat meat**. Lions, sharks, and eagles are carnivores.\n    *   **Omnivores:** These animals **eat both plants and meat**. Bears, humans, and pigs are omnivores.\n\n*   **How do they stay warm?**\n    *   **Warm-blooded (Endothermic):** These animals can **make their own body heat** to stay warm, no matter how cold it is outside. Birds and mammals (like us, dogs, cats, mice) are warm-blooded.\n    *   **Cold-blooded (Ectothermic):** These animals **depend on their surroundings to get warm**. They might bask in the sun to heat up. Reptiles (like lizards and turtles), amphibians (like frogs), and fish are usually cold-blooded.\n\n**Some Fun Examples:**\n\n*   **Mammals:** Furry, give birth to live young, and feed them milk (dogs, cats, humans, whales).\n*   **Birds:** Have feathers, beaks, and lay eggs (sparrows, penguins, eagles).\n*   **Reptiles:** Have scales and usually lay eggs (snakes, lizards, turtles).\n*   **Amphibians:** Start life in water and then live on land (frogs, salamanders).\n*   **Fish:** Live in water, have fins and gills (goldfish, sharks, salmon).\n*   **Insects:** Have six legs and three body parts (ants, butterflies, beetles).\n\nThere are millions and millions of different kinds of animals, and scientists are still discovering new ones!\n\nDo you have any specific animals you're curious about? Or maybe a group you'd like to know more about? I'm here to help you learn! 😊	789	gemini-2.5-flash-lite	chat	6	2026-07-07 05:17:21.896+00	2026-07-07 05:17:21.896+00
9	13	hi unaku tamil therituma ?	Vanakkam! Nan Tamil purinjukiven. Unakku enna udhavi vendum? 😊	63	gemini-2.5-flash-lite	chat	6	2026-07-07 14:29:49.877+00	2026-07-07 14:29:49.877+00
10	13	hii	Hi there! I'm here to help you with your schoolwork. What can I help you with today? 😊	59	gemini-2.5-flash-lite	chat	6	2026-07-07 14:31:06.443+00	2026-07-07 14:31:06.443+00
11	13	vanakkam	Vanakkam! That's a lovely greeting in Tamil. It means "hello" or "greetings."\n\nIs there anything I can help you with today? Do you have any questions about your schoolwork? 😊	80	gemini-2.5-flash-lite	chat	6	2026-07-07 14:31:52.786+00	2026-07-07 14:31:52.786+00
12	13	vanakkam tamil la pesa mudiyuma	Vanakkam! Yes, I can speak Tamil. How can I help you today? Do you have any questions in Tamil? 😊	68	gemini-2.5-flash-lite	chat	6	2026-07-07 14:33:44.135+00	2026-07-07 14:33:44.135+00
13	3	{"classLevel":"6","chapter":"maths","marks":20}	## SAMPLE QUESTION PAPER - 2023-24\n\n**Subject:** Mathematics\n**Class:** VI\n**Total Marks:** 20\n**Time Allowed:** 40 Minutes\n\n---\n\n**Instructions:**\n\n1.  This paper consists of three sections: Section A, Section B, and Section C.\n2.  All questions are compulsory.\n3.  Marks are indicated against each question.\n4.  Read the questions carefully before answering.\n5.  Use blue/black ball point pen only.\n\n---\n\n### **Section A: Multiple Choice Questions (MCQs)**\n\n**(4 x 1 = 4 Marks)**\n\n*Choose the correct option for each question.*\n\n1.  The place value of 5 in the number 7,58,923 is:\n    (a) 50,000\n    (b) 5,000\n    (c) 5,00,000\n    (d) 500\n\n2.  The sum of the smallest 3-digit number and the largest 2-digit number is:\n    (a) 199\n    (b) 200\n    (c) 100\n    (d) 101\n\n3.  Which of the following is an odd number?\n    (a) 12\n    (b) 34\n    (c) 57\n    (d) 68\n\n4.  The perimeter of a square with side length 5 cm is:\n    (a) 10 cm\n    (b) 15 cm\n    (c) 20 cm\n    (d) 25 cm\n\n---\n\n### **Section B: Short Answer Questions**\n\n**(4 x 2 = 8 Marks)**\n\n*Answer the following questions in brief.*\n\n5.  Write the predecessor and successor of the number 10,000.\n\n6.  Arrange the following numbers in ascending order: 308, 380, 803, 830.\n\n7.  Find the product of 345 and 12.\n\n8.  Draw any one angle using a protractor and label it. (No marks for measurement, only for drawing and labelling).\n\n---\n\n### **Section C: Long Answer Questions**\n\n**(2 x 4 = 8 Marks)**\n\n*Solve the following questions with detailed steps.*\n\n9.  Ria has ₹ 5,670 in her bank account. She withdraws ₹ 1,250 to buy a new dress and then deposits ₹ 800 for her birthday money. What is the final balance in her account?\n\n10. A rectangular park has a length of 15 meters and a breadth of 10 meters.\n    (a) Find the area of the park.\n    (b) Find the perimeter of the park.\n\n---\n\n---\n**End of Question Paper**\n---	738	gemini-2.5-flash-lite	question_paper	6	2026-07-07 14:52:11.977+00	2026-07-07 14:52:11.977+00
14	13	Explain addition in tamil	Hey there! So you want to know about addition in Tamil! That's a great question!\n\nIn Tamil, we call **addition** **கூட்டல் (koottal)**.\n\nThink of it like this: when you have some things and you get more things, you put them all together to see how many you have in total. That's what "koottal" is!\n\nHere's a simple example:\n\nIf you have **2** apples and I give you **3** more apples, how many apples do you have altogether?\n\nIn Tamil, we would say:\n\n*   **2** (இரு - iru) apples\n*   **கூட்டல்** (koottal - addition)\n*   **3** (மூன்று - moondru) apples\n*   **சமம்** (samam - equals)\n*   **5** (ஐந்து - ainthu) apples\n\nSo, **2 கூட்டல் 3 சமம் 5**.\n\nThe symbol we use for addition is the same as in English: **+**\n\nSo, **2 + 3 = 5**.\n\nIn Tamil, we also use the word **"சேர்த்து" (serththu)** which means "adding" or "joining together".\n\nFor example, "5-ஐயும் 2-ஐயும் சேர்த்தால் 7 கிடைக்கும்." (5-aiyum 2-aiyum serththal 7 kidaikkum.) This means "If you add 5 and 2, you get 7."\n\n**Key things to remember:**\n\n*   **Addition** is called **கூட்டல் (koottal)**.\n*   The **+** symbol is used.\n*   The word **"சேர்த்து" (serththu)** also means to add or combine.\n\nDo you have any questions about that? We can try more examples if you like! 😊	441	gemini-2.5-flash-lite	chat	6	2026-07-07 17:08:47.339+00	2026-07-07 17:08:47.339+00
15	13	Explain 3+4 in tamil	"Sure, I can help you with that!\n\nIn Tamil, **3 + 4 = 7**\n\nHere's how you say it:\n\n*   **3** is **"moondru"** (மூன்று)\n*   **4** is **"naangu"** (நான்கு)\n*   **Plus** (the '+' sign) is **"kootthal"** (கூட்டல்)\n*   **Equals** (the '=' sign) is **"sama"** (சமா) or you can just say it's the result.\n*   **7** is **"ezhu"** (ஏழு)\n\nSo, you can say **"Moondru kootthal naangu, ezhu"** (மூன்று கூட்டல் நான்கு, ஏழு).\n\nDoes that make sense?"	218	gemini-2.5-flash-lite	chat	6	2026-07-07 17:09:58.261+00	2026-07-07 17:09:58.261+00
16	13	Explain photosynthesis in tamil fully	வணக்கம் மாணவரே! photosynthesis-ஐ தமிழ்ல எளிமையா உங்களுக்கு புரியுற மாதிரி விளக்கறேன்.\n\n**Photosynthesisனா என்ன?**\n\nPhotosynthesis அப்படின்றது ஒரு பெரிய வார்த்தை மாதிரி தெரியும். ஆனா, இது ரொம்ப சிம்பிளான விஷயம். இதை **"ஒளிச்சேர்க்கை"** அப்படின்னு தமிழ்ல சொல்லுவாங்க.\n\n**ஒளிச்சேர்க்கைன்னா என்ன பண்ணுது?**\n\nநம்மள மாதிரி சாப்பிட்டு உயிர் வாழறதுக்கு, தாவரங்களுக்கு (செடிகளுக்கு) ஒரு சிறப்புத் திறன் இருக்கு. அதுதான் இந்த ஒளிச்சேர்க்கை.\n\n**எப்படின்னா:**\n\n*   **சூரிய ஒளி (Sunlight):** சூரியனோட வெளிச்சத்தை எடுத்துக்குது.\n*   **நீர் (Water):** மண்ணுல இருந்து வேர்கள் மூலமா தண்ணியை உறிஞ்சுக்குது.\n*   **கார்பன் டை ஆக்சைடு (Carbon Dioxide):** காத்துல இருக்கிற ஒரு வாயு (gas) இது. நம்ம மூச்சு விடும்போது இதை வெளிய விடுவோம். செடிகள் இந்த வாயுவை இலைகள்ல இருக்கிற சின்ன சின்ன துளைகள் (stomata) வழியா உள்ள இழுத்துக்கும்.\n\nஇந்த மூணும் சேர்ந்தா என்ன நடக்கும் தெரியுமா?\n\n**செடியோட சமையலறை (Leaf's Kitchen):**\n\nசெடிகளோட இலைகள் தான் அதோட சமையலறை மாதிரி. இலைகள்ல **"குளோரோஃபில்" (Chlorophyll)** அப்படின்ற ஒரு பச்சை நிறப்பொருள் இருக்கும். இந்த குளோரோஃபில் தான் சூரிய ஒளியை பிடிக்கிறதுக்கு உதவுது.\n\n**என்ன சமைக்குது?**\n\nசூரிய ஒளி, நீர், கார்பன் டை ஆக்சைடு இதையெல்லாம் பயன்படுத்தி, செடி தனக்கு தேவையான **உணவை (Food)** தயாரிக்குது. அந்த உணவுக்கு பேரு **"குளுக்கோஸ்" (Glucose)**. இது ஒரு வகை சர்க்கரை மாதிரி. இதுதான் செடி வளரதுக்கும், உயிர் வாழ்றதுக்கும் தேவையான சக்தி (Energy) கொடுக்குது.\n\n**அதுமட்டுமில்ல, இன்னும் ஒன்னு நமக்கு கிடைக்குது!**\n\nஇந்த ஒளிச்சேர்க்கை நடக்கும்போது, செடி நமக்கு ரொம்ப முக்கியமான ஒன்னு கொடுக்குது. அதுதான் **"ஆக்ஸிஜன்" (Oxygen)**. நம்ம சுவாசிக்கிறதுக்கு இந்த ஆக்ஸிஜன் தான் ரொம்ப அவசியம்.\n\n**சுருக்கமா சொல்லணும்னா:**\n\n**சூரிய ஒளி + நீர் + கார்பன் டை ஆக்சைடு → உணவு (குளுக்கோஸ்) + ஆக்ஸிஜன்**\n\n**ஏன் இது முக்கியம்?**\n\n1.  **உணவு:** செடிகளுக்கு தேவையான உணவை இது தயாரிக்குது.\n2.  **ஆக்ஸிஜன்:** நம்ம சுவாசிக்கிறதுக்கு தேவையான ஆக்ஸிஜனை கொடுக்குது.\n3.  **சங்கிலி:** உலகம் முழுக்க இருக்கிற எல்லா உயிரினங்களுக்கும் (மனிதர்கள், விலங்குகள்) இது ஒரு உணவுச் சங்கிலியின் (Food Chain) அடிப்படை. ஏன்னா, நம்ம நேரடியா இல்லனா மறைமுகமா செடிகளை சார்ந்து தான் வாழறோம்.\n\n**உங்களுக்கு புரிஞ்சிருக்கும்னு நினைக்கிறேன். வேற ஏதாவது சந்தேகம் இருந்தா கேளுங்க!**	691	gemini-2.5-flash-lite	chat	6	2026-07-07 17:10:28.503+00	2026-07-07 17:10:28.503+00
17	13	Explain gravity with example	Hey there! Let's talk about gravity!\n\nImagine you have a ball in your hand. When you let go, what happens? It falls to the ground, right? That's gravity at work!\n\n**Gravity is like an invisible pull or force that every object in the universe has.** The bigger and heavier an object is, the stronger its gravity is.\n\nThink of the Earth. The Earth is huge! Because it's so big and heavy, it has a really strong gravity. This is why when you jump, you always come back down. The Earth's gravity is pulling you towards it!\n\n**Here's a simple example:**\n\n*   **You drop a pencil.** The pencil doesn't float away, does it? It falls to the floor. That's because the Earth's gravity is pulling the pencil down.\n*   **The Moon orbits the Earth.** The Moon is constantly being pulled towards the Earth by gravity. If gravity wasn't there, the Moon would just float off into space!\n*   **You stay on the ground.** You don't float off into space either! The Earth's gravity is keeping you firmly planted.\n\nSo, gravity is the reason things fall down, the reason we stay on the ground, and even the reason planets orbit the sun! It's a super important force that keeps everything in its place.\n\nDoes that make sense? Let me know if you have any more questions! 😊	342	gemini-2.5-flash-lite	chat	6	2026-07-07 17:11:50.146+00	2026-07-07 17:11:50.146+00
18	3	{"classLevel":"6","chapter":"Maths","marks":1}	## **SAMPLE PAPER FOR ASSESSMENT - 1**\n\n**Class: VI**\n**Subject: Mathematics**\n**Maximum Marks: 1**\n**Time Allowed:** (Implicitly, for a single mark question, time is negligible but for structure, we'll assume it's part of a larger assessment)\n\n---\n\n**General Instructions:**\n\n1.  This paper consists of **three sections**: Section A, Section B, and Section C.\n2.  All questions are **compulsory**.\n3.  Marks for each question are indicated against it.\n4.  **Follow the marking scheme and instructions specific to each section.**\n\n---\n\n### **SECTION A: MULTIPLE CHOICE QUESTIONS (MCQ)**\n\n**(1 Mark)**\n\n**1.** Which of the following numbers is divisible by both 2 and 5?\n\n(a) 105\n(b) 250\n(c) 340\n(d) Both (b) and (c)\n\n---\n\n### **SECTION B: SHORT ANSWER QUESTIONS**\n\n**(Implicitly 0 Marks for this single-mark paper, but for structure, let's imagine this question would normally carry marks)**\n\n*(No questions are provided in this section for a 1-mark paper as it would defeat the purpose of having sections for varying difficulty. This section would typically be used for questions carrying 2-3 marks each.)*\n\n---\n\n### **SECTION C: LONG ANSWER QUESTIONS**\n\n**(Implicitly 0 Marks for this single-mark paper, but for structure, let's imagine this question would normally carry marks)**\n\n*(No questions are provided in this section for a 1-mark paper. This section would typically be used for questions carrying 4-5 marks each.)*\n\n---\n**End of Sample Paper**\n\n---\n\n**Explanation of the CBSE-Style Structure for a 1-Mark Question:**\n\n*   **Class and Subject:** Clearly stated.\n*   **Chapter:** Specified as "Maths" (though in a real CBSE paper, it would be a specific chapter or a broader topic).\n*   **Total Marks:** Explicitly "1".\n*   **Instructions:** Standard CBSE exam instructions are included for completeness.\n*   **Paper Structure:** Defined with Section A, B, and C.\n*   **Marks for each question:** Indicated.\n\n**Why only Section A is populated for a 1-Mark Question:**\n\nThe request is for a **1-mark** question paper that follows CBSE style. In a real CBSE exam, a 1-mark question would typically be a single MCQ or a very simple fill-in-the-blanks/true-false that could be completed in a very short time.\n\n*   **Section A (MCQ):** This is the most appropriate place for a 1-mark question. It tests basic understanding and recall. The example provided requires knowledge of divisibility rules.\n*   **Section B (Short Answer):** This section is designed for questions that require a bit more explanation, calculation, or a multi-step process, usually carrying 2-3 marks. For a 1-mark paper, it's not feasible to include such questions.\n*   **Section C (Long Answer):** This section is for more in-depth problem-solving, requiring significant calculation or explanation, typically carrying 4-5 marks. It's impossible to have a long answer question worth only 1 mark without making it trivial.\n\nTherefore, for a 1-mark paper, the most logical and CBSE-aligned approach is to have a single question in Section A. The other sections are included in the structure to demonstrate adherence to the requested format, even though they remain empty for this specific mark allocation.	873	gemini-2.5-flash-lite	question_paper	6	2026-07-08 04:17:37.576+00	2026-07-08 04:17:37.576+00
\.


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendances (id, school_id, teacher_class_session_id, class_id, section_id, student_id, date, status, marked_by, created_at, updated_at, created_by, updated_by, academic_year_id) FROM stdin;
1	1	1	1	1	10	2026-07-04	present	3	2026-07-04 05:28:56.028+00	2026-07-04 05:28:56.028+00	\N	\N	1
2	1	1	1	1	9	2026-07-04	present	3	2026-07-04 05:28:56.405+00	2026-07-04 05:28:56.405+00	\N	\N	1
3	1	1	1	1	8	2026-07-04	present	3	2026-07-04 05:28:56.779+00	2026-07-04 05:28:56.779+00	\N	\N	1
4	1	1	1	1	7	2026-07-04	present	3	2026-07-04 05:28:57.153+00	2026-07-04 05:28:57.153+00	\N	\N	1
5	1	1	1	1	6	2026-07-04	present	3	2026-07-04 05:28:57.526+00	2026-07-04 05:28:57.526+00	\N	\N	1
6	1	1	1	1	5	2026-07-04	present	3	2026-07-04 05:28:57.9+00	2026-07-04 05:28:57.9+00	\N	\N	1
7	1	1	1	1	4	2026-07-04	present	3	2026-07-04 05:28:58.274+00	2026-07-04 05:28:58.274+00	\N	\N	1
8	1	1	1	1	3	2026-07-04	present	3	2026-07-04 05:28:58.647+00	2026-07-04 05:28:58.647+00	\N	\N	1
9	1	1	1	1	2	2026-07-04	present	3	2026-07-04 05:28:59.021+00	2026-07-04 05:28:59.021+00	\N	\N	1
10	1	1	1	1	1	2026-07-04	present	3	2026-07-04 05:28:59.394+00	2026-07-04 05:28:59.394+00	\N	\N	1
11	1	\N	1	1	1	2026-07-08	present	3	2026-07-07 05:05:07.407+00	2026-07-07 05:05:07.407+00	3	3	1
12	1	\N	1	1	1	2026-07-09	absent	3	2026-07-07 05:05:22.091+00	2026-07-07 05:05:22.091+00	3	3	1
13	1	\N	1	1	1	2026-07-10	on_duty	3	2026-07-07 05:05:39.1+00	2026-07-07 05:05:39.1+00	3	3	1
15	1	\N	1	1	1	2026-06-08	present	3	2026-07-07 14:43:14.183+00	2026-07-07 14:43:14.183+00	3	3	1
16	1	\N	1	1	1	2026-06-09	present	3	2026-07-07 14:43:30.45+00	2026-07-07 14:43:30.45+00	3	3	1
17	1	\N	1	1	1	2026-06-10	present	3	2026-07-07 14:43:44.899+00	2026-07-07 14:43:44.899+00	3	3	1
18	1	\N	1	1	1	2026-06-11	present	3	2026-07-07 14:43:55.721+00	2026-07-07 14:43:55.721+00	3	3	1
19	1	\N	1	1	1	2026-06-12	on_duty	3	2026-07-07 14:44:05.601+00	2026-07-07 14:44:05.601+00	3	3	1
20	1	\N	1	1	1	2026-06-13	present	3	2026-07-07 14:44:29.649+00	2026-07-07 14:44:29.649+00	3	3	1
22	1	\N	1	1	1	2026-06-15	present	3	2026-07-07 14:44:48.471+00	2026-07-07 14:44:48.471+00	3	3	1
23	1	\N	1	1	1	2026-06-16	present	3	2026-07-07 14:44:55.385+00	2026-07-07 14:44:55.385+00	3	3	1
24	1	\N	1	1	1	2026-06-17	present	3	2026-07-07 14:45:02.059+00	2026-07-07 14:45:02.059+00	3	3	1
25	1	\N	1	1	1	2026-06-18	present	3	2026-07-07 14:45:10.731+00	2026-07-07 14:45:10.731+00	3	3	1
26	1	\N	1	1	1	2026-06-19	present	3	2026-07-07 14:45:19.741+00	2026-07-07 14:45:19.741+00	3	3	1
27	1	\N	1	1	1	2026-06-20	present	3	2026-07-07 14:45:28.543+00	2026-07-07 14:45:28.543+00	3	3	1
29	1	\N	1	1	1	2026-06-22	present	3	2026-07-07 14:45:43.446+00	2026-07-07 14:45:43.446+00	3	3	1
30	1	\N	1	1	1	2026-06-23	present	3	2026-07-07 14:45:49.621+00	2026-07-07 14:45:49.621+00	3	3	1
31	1	\N	1	1	1	2026-06-24	present	3	2026-07-07 14:45:56.781+00	2026-07-07 14:45:56.781+00	3	3	1
32	1	\N	1	1	1	2026-06-29	present	3	2026-07-07 14:46:03.126+00	2026-07-07 14:46:03.126+00	3	3	1
33	1	\N	1	1	1	2026-06-25	present	3	2026-07-07 14:46:08.608+00	2026-07-07 14:46:08.608+00	3	3	1
34	1	\N	1	1	1	2026-06-26	present	3	2026-07-07 14:46:14.639+00	2026-07-07 14:46:14.639+00	3	3	1
35	1	\N	1	1	1	2026-06-27	present	3	2026-07-07 14:46:21.401+00	2026-07-07 14:46:21.401+00	3	3	1
37	1	\N	1	1	1	2026-06-01	present	3	2026-07-07 14:47:19.732+00	2026-07-07 14:47:19.732+00	3	3	1
38	1	\N	1	1	1	2026-06-02	present	3	2026-07-07 14:47:25.819+00	2026-07-07 14:47:25.819+00	3	3	1
39	1	\N	1	1	1	2026-06-03	present	3	2026-07-07 14:47:31.794+00	2026-07-07 14:47:31.794+00	3	3	1
40	1	\N	1	1	1	2026-06-04	present	3	2026-07-07 14:47:37.785+00	2026-07-07 14:47:37.785+00	3	3	1
41	1	\N	1	1	1	2026-06-05	present	3	2026-07-07 14:47:44.119+00	2026-07-07 14:47:44.119+00	3	3	1
42	1	\N	1	1	1	2026-06-06	present	3	2026-07-07 14:47:50.229+00	2026-07-07 14:47:50.229+00	3	3	1
43	1	\N	1	1	1	2026-06-30	present	3	2026-07-07 14:47:57.748+00	2026-07-07 14:47:57.748+00	3	3	1
14	1	\N	1	1	1	2026-06-07	absent	3	2026-07-07 14:42:38.454+00	2026-07-07 14:48:32.81+00	3	3	1
21	1	\N	1	1	1	2026-06-14	absent	3	2026-07-07 14:44:40.187+00	2026-07-07 14:48:44.98+00	3	3	1
28	1	\N	1	1	1	2026-06-21	absent	3	2026-07-07 14:45:37.158+00	2026-07-07 14:48:56.906+00	3	3	1
36	1	\N	1	1	1	2026-06-28	absent	3	2026-07-07 14:46:28.56+00	2026-07-07 14:49:13.969+00	3	3	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, entity_type, entity_id, action, remark, performed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.classes (id, school_id, class_name, class_teacher_id, is_active, created_at, updated_at) FROM stdin;
1	1	6	\N	t	2026-07-04 05:04:13.294+00	2026-07-04 05:04:13.294+00
2	1	7	\N	t	2026-07-04 05:04:22.59+00	2026-07-04 05:04:22.59+00
8	1	8	\N	t	2026-07-07 06:36:06.181+00	2026-07-07 06:36:06.181+00
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.drivers (id, user_id, school_id, license_number, is_active, created_at, updated_at) FROM stdin;
2	66	1	DL-54321	t	2026-07-07 04:55:31.957+00	2026-07-07 04:55:31.957+00
1	53	1	DL-12345	t	2026-07-04 05:13:36.289+00	2026-07-07 04:57:08.877+00
\.


--
-- Data for Name: exam_masters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exam_masters (id, school_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: exam_subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exam_subjects (id, exam_id, subject_id, syllabus, exam_date, created_at, updated_at) FROM stdin;
2	1	3	chap1	2026-07-30	2026-07-04 05:19:03.641+00	2026-07-04 05:19:03.641+00
4	3	1	The first 10 example sums	2026-07-08	2026-07-07 04:13:17.333+00	2026-07-07 04:13:17.333+00
5	3	3	First two lessons	2026-07-09	2026-07-07 05:08:30.02+00	2026-07-07 05:08:30.02+00
1	2	3	First chapter	2026-07-10	2026-07-04 05:18:39.399+00	2026-07-07 05:11:21.897+00
7	2	4	\N	2026-07-08	2026-07-07 06:13:57.829+00	2026-07-07 06:13:57.829+00
8	1	2	\N	2026-07-24	2026-07-07 06:14:15.749+00	2026-07-07 06:14:15.749+00
9	2	2	\N	2026-07-07	2026-07-07 06:15:11.117+00	2026-07-07 06:15:11.117+00
10	1	1	\N	2026-07-07	2026-07-07 06:15:21.595+00	2026-07-07 06:15:21.595+00
11	3	4	\N	2026-07-10	2026-07-07 06:15:31+00	2026-07-07 06:15:31+00
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exams (id, school_id, class_id, name, exam_master_id, is_locked, created_at, updated_at, academic_year_id) FROM stdin;
1	1	1	class test	\N	f	2026-07-04 05:17:50.921+00	2026-07-04 05:17:50.921+00	1
2	1	1	midterm	\N	f	2026-07-04 05:18:11.296+00	2026-07-04 05:18:11.296+00	1
3	1	1	REGULAR TEST	\N	f	2026-07-07 04:12:32.345+00	2026-07-07 04:12:32.345+00	1
\.


--
-- Data for Name: families; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.families (id, school_id, father_name, mother_name, guardian_phone, address, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feedbacks (id, school_id, title, category, description, screenshot_url, user_id, role, browser, app_version, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: game_session_players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_session_players (id, session_id, user_id, socket_id, is_host, current_question_index, status, score, joined_at, left_at, finished_at, created_at, updated_at) FROM stdin;
1	1	13	\N	t	0	FINISHED	3	2026-07-04 06:03:57.182+00	\N	2026-07-04 06:04:20.085+00	2026-07-04 06:03:57.182+00	2026-07-04 06:04:20.085+00
2	2	13	\N	t	0	FINISHED	2	2026-07-06 15:29:10.009+00	\N	2026-07-06 15:29:25.045+00	2026-07-06 15:29:10.009+00	2026-07-06 15:29:25.045+00
3	3	13	\N	t	0	FINISHED	4	2026-07-07 14:37:53.947+00	\N	2026-07-07 14:39:42.972+00	2026-07-07 14:37:53.947+00	2026-07-07 14:39:42.973+00
4	4	13	\N	t	0	FINISHED	1	2026-07-08 04:19:03.844+00	\N	2026-07-08 04:19:24.346+00	2026-07-08 04:19:03.844+00	2026-07-08 04:19:24.346+00
5	5	13	\N	t	0	PLAYING	0	2026-07-09 10:13:00.402+00	\N	\N	2026-07-09 10:13:00.402+00	2026-07-09 10:13:00.402+00
\.


--
-- Data for Name: game_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_sessions (id, quiz_id, mode, room_code, host_user_id, max_players, total_time_ms, status, started_at, ended_at, created_at, updated_at) FROM stdin;
1	1	SINGLE	\N	13	\N	300000	FINISHED	2026-07-04 06:03:56.996+00	2026-07-04 06:04:20.27+00	2026-07-04 06:03:56.996+00	2026-07-04 06:04:20.27+00
2	2	SINGLE	\N	13	\N	300000	FINISHED	2026-07-06 15:29:09.818+00	2026-07-06 15:29:25.23+00	2026-07-06 15:29:09.818+00	2026-07-06 15:29:25.23+00
3	3	SINGLE	\N	13	\N	300000	FINISHED	2026-07-07 14:37:53.776+00	2026-07-07 14:39:43.131+00	2026-07-07 14:37:53.776+00	2026-07-07 14:39:43.131+00
4	4	SINGLE	\N	13	\N	300000	FINISHED	2026-07-08 04:19:03.665+00	2026-07-08 04:19:24.502+00	2026-07-08 04:19:03.666+00	2026-07-08 04:19:24.503+00
5	5	SINGLE	\N	13	\N	300000	IN_PROGRESS	2026-07-09 10:13:00.241+00	\N	2026-07-09 10:13:00.241+00	2026-07-09 10:13:00.241+00
\.


--
-- Data for Name: group_chat_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_chat_members (id, group_chat_id, user_id, role, joined_at, left_at, created_at, updated_at) FROM stdin;
1	1	3	teacher	2026-07-04 05:29:37.602+00	\N	2026-07-04 05:29:37.602+00	2026-07-04 05:29:37.602+00
2	1	13	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
3	1	14	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
4	1	15	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
5	1	16	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
6	1	17	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
7	1	18	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
8	1	19	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
9	1	20	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
10	1	21	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
11	1	22	student	2026-07-04 05:29:37.976+00	\N	2026-07-04 05:29:37.976+00	2026-07-04 05:29:37.976+00
\.


--
-- Data for Name: group_chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_chat_messages (id, group_chat_id, sender_user_id, message_type, message_text, image_url, deleted_at, created_at, updated_at) FROM stdin;
1	1	3	text	hi	\N	\N	2026-07-04 05:29:45.048+00	2026-07-04 05:29:45.048+00
2	1	13	text	hi	\N	\N	2026-07-04 06:05:10.467+00	2026-07-04 06:05:10.467+00
3	1	3	text	Hii	\N	\N	2026-07-07 05:07:18.923+00	2026-07-07 05:07:18.923+00
4	1	3	text	How you done your homework priya 	\N	\N	2026-07-07 05:07:33.68+00	2026-07-07 05:07:33.68+00
\.


--
-- Data for Name: group_chats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_chats (id, teacher_id, subject_id, class_id, section_id, is_active, created_at, updated_at) FROM stdin;
1	3	3	1	1	t	2026-07-04 05:29:37.415+00	2026-07-04 05:29:37.415+00
\.


--
-- Data for Name: homework_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.homework_submissions (id, homework_id, student_id, is_completed, remark, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: homeworks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.homeworks (id, school_id, class_id, section_id, teacher_assignment_id, subject_id, homework_date, description, created_by, created_at, updated_at, academic_year_id) FROM stdin;
1	1	1	1	2	3	2026-07-05	Finish grammar	3	2026-07-04 05:30:29.38+00	2026-07-04 05:30:29.38+00	1
\.


--
-- Data for Name: lost_found_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lost_found_items (id, school_id, title, type, description, date, photos, status, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_acks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_acks (id, notification_id, user_id, user_role, acknowledged_at) FROM stdin;
1	1	3	teacher	2026-07-07 05:07:01.598+00
2	1	13	student	2026-07-08 18:16:31.912+00
3	2	13	student	2026-07-08 18:16:40.351+00
4	3	13	student	2026-07-08 18:16:42.042+00
5	4	13	student	2026-07-08 18:16:43.367+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, school_id, sender_user_id, sender_role, title, message, target_role, class_id, section_id, is_active, created_at, updated_at) FROM stdin;
1	1	2	school_admin	parents teachers meeting	parents teachers meeting will be conducted on 20-8-26	all	\N	\N	t	2026-07-04 05:17:27.816+00	2026-07-04 05:17:27.816+00
2	1	2	teacher	Report Card Published	Report card for Priya (midterm) has been published.	student	1	1	t	2026-07-04 05:19:30.594+00	2026-07-04 05:19:30.594+00
3	1	2	teacher	Report Card Published	Report card for Priya (class test) has been published.	student	1	1	t	2026-07-04 05:19:49.989+00	2026-07-04 05:19:49.989+00
4	1	3	teacher	New Homework Assigned	New homework has been assigned for english. Please check.	all	1	1	t	2026-07-04 05:30:29.566+00	2026-07-04 05:30:29.566+00
5	1	2	teacher	Report Card Published	Report card for Priya (REGULAR TEST) has been published.	student	1	1	t	2026-07-07 06:16:00.948+00	2026-07-07 06:16:00.948+00
\.


--
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parents (id, user_id, student_id, approval_status, approved_by, approved_at, relation_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: player_answers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.player_answers (id, session_player_id, question_id, selected_option_index, is_correct, time_taken_ms, answered_at, created_at, updated_at) FROM stdin;
1	1	1	0	t	\N	2026-07-04 06:04:18.432+00	2026-07-04 06:04:18.432+00	2026-07-04 06:04:18.432+00
2	1	2	0	f	\N	2026-07-04 06:04:18.8+00	2026-07-04 06:04:18.8+00	2026-07-04 06:04:18.8+00
3	1	3	0	f	\N	2026-07-04 06:04:19.166+00	2026-07-04 06:04:19.166+00	2026-07-04 06:04:19.166+00
4	1	4	3	t	\N	2026-07-04 06:04:19.531+00	2026-07-04 06:04:19.531+00	2026-07-04 06:04:19.531+00
5	1	5	2	t	\N	2026-07-04 06:04:19.901+00	2026-07-04 06:04:19.901+00	2026-07-04 06:04:19.901+00
6	2	6	0	t	\N	2026-07-06 15:29:23.383+00	2026-07-06 15:29:23.384+00	2026-07-06 15:29:23.384+00
7	2	7	0	f	\N	2026-07-06 15:29:23.754+00	2026-07-06 15:29:23.754+00	2026-07-06 15:29:23.754+00
8	2	8	0	f	\N	2026-07-06 15:29:24.123+00	2026-07-06 15:29:24.123+00	2026-07-06 15:29:24.123+00
9	2	9	0	f	\N	2026-07-06 15:29:24.491+00	2026-07-06 15:29:24.492+00	2026-07-06 15:29:24.492+00
10	2	10	0	t	\N	2026-07-06 15:29:24.86+00	2026-07-06 15:29:24.86+00	2026-07-06 15:29:24.86+00
11	3	11	0	t	\N	2026-07-07 14:39:41.554+00	2026-07-07 14:39:41.554+00	2026-07-07 14:39:41.554+00
12	3	12	2	t	\N	2026-07-07 14:39:41.871+00	2026-07-07 14:39:41.871+00	2026-07-07 14:39:41.871+00
13	3	13	1	t	\N	2026-07-07 14:39:42.185+00	2026-07-07 14:39:42.185+00	2026-07-07 14:39:42.185+00
14	3	14	2	f	\N	2026-07-07 14:39:42.5+00	2026-07-07 14:39:42.5+00	2026-07-07 14:39:42.5+00
15	3	15	2	t	\N	2026-07-07 14:39:42.815+00	2026-07-07 14:39:42.815+00	2026-07-07 14:39:42.815+00
16	4	16	0	t	\N	2026-07-08 04:19:22.941+00	2026-07-08 04:19:22.941+00	2026-07-08 04:19:22.941+00
17	4	17	0	f	\N	2026-07-08 04:19:23.255+00	2026-07-08 04:19:23.255+00	2026-07-08 04:19:23.255+00
18	4	18	0	f	\N	2026-07-08 04:19:23.566+00	2026-07-08 04:19:23.566+00	2026-07-08 04:19:23.566+00
19	4	19	0	f	\N	2026-07-08 04:19:23.878+00	2026-07-08 04:19:23.878+00	2026-07-08 04:19:23.878+00
20	4	20	0	f	\N	2026-07-08 04:19:24.19+00	2026-07-08 04:19:24.19+00	2026-07-08 04:19:24.19+00
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quiz_questions (id, quiz_id, order_index, question_text, options, correct_option_index, created_at, updated_at) FROM stdin;
1	1	0	Which planet is known as the "Red Planet" due to its rusty appearance?	["Mars", "Jupiter", "Venus", "Saturn"]	0	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
2	1	1	What is the largest planet in our solar system?	["Earth", "Saturn", "Jupiter", "Neptune"]	2	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
3	1	2	Which planet is closest to the Sun?	["Venus", "Mercury", "Earth", "Mars"]	1	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
4	1	3	What is the name of the force that keeps the planets orbiting the Sun?	["Magnetism", "Electricity", "Friction", "Gravity"]	3	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
5	1	4	Which planet is famous for its prominent rings, made mostly of ice particles and dust?	["Uranus", "Jupiter", "Saturn", "Neptune"]	2	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
6	2	0	A train travels 360 kilometers in 4 hours. What is the average speed of the train in kilometers per hour?	["90 km/h", "80 km/h", "75 km/h", "95 km/h"]	0	2026-07-06 15:29:07.594+00	2026-07-06 15:29:07.594+00
7	2	1	What is the sum of the largest 4-digit number and the smallest 3-digit number?	["10099", "9999", "10999", "10009"]	2	2026-07-06 15:29:07.594+00	2026-07-06 15:29:07.594+00
8	2	2	A rectangle has a length of 15 cm and a width of 8 cm. What is its area?	["23 sq cm", "46 sq cm", "120 sq cm", "130 sq cm"]	2	2026-07-06 15:29:07.594+00	2026-07-06 15:29:07.594+00
9	2	3	Convert 2.75 kilograms to grams.	["27.5 grams", "275 grams", "2750 grams", "27500 grams"]	2	2026-07-06 15:29:07.594+00	2026-07-06 15:29:07.594+00
10	2	4	If a shopkeeper buys 12 dozen apples and sells 98 apples, how many apples are left?	["46", "144", "98", "24"]	0	2026-07-06 15:29:07.594+00	2026-07-06 15:29:07.594+00
11	3	0	What does AI stand for?	["Artificial Intelligence", "Amazing Invention", "Apple Ideas", "All Information"]	0	2026-07-07 14:37:51.76+00	2026-07-07 14:37:51.76+00
12	3	1	Which of these is an example of AI that helps you find information on the internet?	["A calculator", "A video game character", "A search engine like Google", "A pencil sharpener"]	2	2026-07-07 14:37:51.76+00	2026-07-07 14:37:51.76+00
13	3	2	What do AI systems learn from to become smarter?	["Sleep", "Data", "Sunshine", "Eating snacks"]	1	2026-07-07 14:37:51.76+00	2026-07-07 14:37:51.76+00
14	3	3	When a smart speaker like Alexa or Google Assistant understands your voice commands, it is using AI to:	["Play hide-and-seek", "Recognize speech", "Tell jokes", "Take a nap"]	1	2026-07-07 14:37:51.76+00	2026-07-07 14:37:51.76+00
15	3	4	AI can help computers do tasks that normally require human:	["Sleeping", "Eating", "Thinking and learning", "Breathing"]	2	2026-07-07 14:37:51.76+00	2026-07-07 14:37:51.76+00
16	4	0	What is the value of 3.75 + 2.5?	["6.25", "5.25", "6.00", "5.50"]	0	2026-07-08 04:19:01.341+00	2026-07-08 04:19:01.341+00
17	4	1	If a train travels at 60 km per hour, how far will it travel in 3.5 hours?	["180 km", "210 km", "200 km", "225 km"]	1	2026-07-08 04:19:01.341+00	2026-07-08 04:19:01.341+00
18	4	2	A rectangle has a length of 12 cm and a width of 7 cm. What is its area?	["38 cm²", "84 cm²", "19 cm²", "42 cm²"]	1	2026-07-08 04:19:01.341+00	2026-07-08 04:19:01.341+00
19	4	3	What is 7/10 as a decimal?	["0.07", "0.7", "7.0", "0.007"]	1	2026-07-08 04:19:01.341+00	2026-07-08 04:19:01.341+00
20	4	4	Find the greatest common factor (GCF) of 18 and 24.	["3", "6", "12", "2"]	1	2026-07-08 04:19:01.341+00	2026-07-08 04:19:01.341+00
21	5	0	Which planet is known as the 'Red Planet' due to its rusty appearance?	["Venus", "Mars", "Jupiter", "Saturn"]	1	2026-07-09 10:12:57.912+00	2026-07-09 10:12:57.912+00
22	5	1	What is the largest planet in our solar system?	["Earth", "Saturn", "Jupiter", "Neptune"]	2	2026-07-09 10:12:57.912+00	2026-07-09 10:12:57.912+00
23	5	2	Which of these is NOT a rocky planet (terrestrial planet)?	["Mercury", "Venus", "Earth", "Uranus"]	3	2026-07-09 10:12:57.912+00	2026-07-09 10:12:57.912+00
24	5	3	What is the name of the star at the center of our solar system?	["Moon", "Alpha Centauri", "Sun", "Sirius"]	2	2026-07-09 10:12:57.912+00	2026-07-09 10:12:57.912+00
25	5	4	Which planet is famous for its prominent rings?	["Mars", "Jupiter", "Uranus", "Saturn"]	3	2026-07-09 10:12:57.912+00	2026-07-09 10:12:57.912+00
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quizzes (id, owner_user_id, topic, title, difficulty, num_questions, created_at, updated_at) FROM stdin;
1	13	solar system	Solar System Quiz - Class 5	MEDIUM	5	2026-07-04 06:03:54.402+00	2026-07-04 06:03:54.402+00
2	13	Math	Class 5 Math Quiz - Medium Difficulty	MEDIUM	5	2026-07-06 15:29:07.396+00	2026-07-06 15:29:07.396+00
3	13	about ai	AI Explorer Quiz - Grade 5	MEDIUM	5	2026-07-07 14:37:51.588+00	2026-07-07 14:37:51.588+00
4	13	Math	Class 5 Math Quiz (Medium Difficulty)	MEDIUM	5	2026-07-08 04:19:01.162+00	2026-07-08 04:19:01.162+00
5	13	solor system	Solar System Quiz - Class 5	MEDIUM	5	2026-07-09 10:12:57.715+00	2026-07-09 10:12:57.715+00
\.


--
-- Data for Name: report_card_marks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_card_marks (id, report_card_id, subject_id, marks_obtained, max_marks, created_at, updated_at) FROM stdin;
4	4	1	60	100	2026-07-07 04:14:00.623+00	2026-07-07 04:14:00.623+00
6	5	1	45	100	2026-07-07 06:15:54.473+00	2026-07-07 06:15:54.473+00
7	5	3	60	100	2026-07-07 06:15:54.659+00	2026-07-07 06:15:54.659+00
8	5	4	80	100	2026-07-07 06:15:54.843+00	2026-07-07 06:15:54.843+00
9	2	1	50	100	2026-07-07 06:24:21.949+00	2026-07-07 06:24:21.949+00
10	2	2	60	100	2026-07-07 06:24:22.13+00	2026-07-07 06:24:22.13+00
11	2	3	80	100	2026-07-07 06:24:22.309+00	2026-07-07 06:24:22.309+00
12	1	2	90	100	2026-07-07 06:25:35.75+00	2026-07-07 06:25:35.75+00
13	1	4	80	100	2026-07-07 06:25:35.935+00	2026-07-07 06:25:35.935+00
14	1	3	90	100	2026-07-07 06:25:36.118+00	2026-07-07 06:25:36.118+00
\.


--
-- Data for Name: report_cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_cards (id, student_id, class_id, exam_id, school_id, remarks, published_at, created_at, updated_at, academic_year_id) FROM stdin;
1	1	1	2	1		2026-07-04 05:19:30.41+00	2026-07-04 05:19:18.848+00	2026-07-04 05:19:30.41+00	1
2	1	1	1	1		2026-07-04 05:19:49.805+00	2026-07-04 05:19:38.148+00	2026-07-04 05:19:49.805+00	1
3	2	1	2	1	\N	\N	2026-07-05 14:48:34.526+00	2026-07-05 14:48:34.526+00	1
4	5	1	3	1	\N	\N	2026-07-07 04:13:34.623+00	2026-07-07 04:13:34.623+00	1
5	1	1	3	1		2026-07-07 06:16:00.765+00	2026-07-07 04:14:05.045+00	2026-07-07 06:16:00.765+00	1
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schools (id, school_name, school_code, cbse_affiliation_no, address, city, state, zip, contact_phone, logo_url, email, status, created_at, updated_at) FROM stdin;
1	bharathi	1	\N	\N	\N	\N	\N	\N	\N	\N	active	2026-07-04 03:34:34.788+00	2026-07-04 03:34:34.788+00
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sections (id, school_id, class_id, class_teacher_id, name, is_active, created_at, updated_at) FROM stdin;
1	1	1	\N	A	t	2026-07-04 05:04:13.847+00	2026-07-04 05:04:13.847+00
2	1	1	\N	B	t	2026-07-04 05:04:18.221+00	2026-07-04 05:04:18.221+00
3	1	2	\N	A	t	2026-07-04 05:04:23.135+00	2026-07-04 05:04:23.135+00
4	1	2	\N	B	t	2026-07-04 05:04:27.501+00	2026-07-04 05:04:27.501+00
13	1	8	\N	A	t	2026-07-07 06:36:16.47+00	2026-07-07 06:36:16.47+00
14	1	8	\N	B	t	2026-07-07 06:36:22.938+00	2026-07-07 06:36:22.938+00
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: student_enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_enrollments (id, student_id, academic_year_id, class_id, section_id, roll_no, created_at, updated_at) FROM stdin;
1	1	1	1	1	\N	2026-07-07 13:31:13.522079+00	2026-07-07 13:31:13.522079+00
\.


--
-- Data for Name: student_transports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_transports (student_id, school_id, vehicle_id, pickup_point, is_active, created_at, updated_at) FROM stdin;
1	1	2	vijaymanagalam	t	2026-07-04 05:14:21.825+00	2026-07-07 05:26:46.431+00
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.students (id, user_id, school_id, class_id, section_id, roll_no, admission_no, dob, gender, father_name, mother_name, guardian_name, address, blood_group, aadhar_no, father_occupation, mother_occupation, family_income, guardian_occupation, emergency_contact, residential_status, is_active, approval_status, approved_by, rejection_reason, approved_at, created_at, updated_at, family_id, status) FROM stdin;
2	14	1	1	1	\N	ADM-S00002	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:14.761+00	2026-07-04 05:04:14.761+00	\N	ACTIVE
3	15	1	1	1	\N	ADM-S00003	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:15.125+00	2026-07-04 05:04:15.125+00	\N	ACTIVE
4	16	1	1	1	\N	ADM-S00004	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:15.49+00	2026-07-04 05:04:15.49+00	\N	ACTIVE
5	17	1	1	1	\N	ADM-S00005	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:15.854+00	2026-07-04 05:04:15.854+00	\N	ACTIVE
6	18	1	1	1	\N	ADM-S00006	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:16.218+00	2026-07-04 05:04:16.218+00	\N	ACTIVE
7	19	1	1	1	\N	ADM-S00007	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:16.582+00	2026-07-04 05:04:16.582+00	\N	ACTIVE
8	20	1	1	1	\N	ADM-S00008	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:16.947+00	2026-07-04 05:04:16.947+00	\N	ACTIVE
9	21	1	1	1	\N	ADM-S00009	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:17.311+00	2026-07-04 05:04:17.311+00	\N	ACTIVE
10	22	1	1	1	\N	ADM-S00010	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:17.676+00	2026-07-04 05:04:17.676+00	\N	ACTIVE
11	23	1	1	2	\N	ADM-S00021	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:18.766+00	2026-07-04 05:04:18.766+00	\N	ACTIVE
12	24	1	1	2	\N	ADM-S00022	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:19.131+00	2026-07-04 05:04:19.131+00	\N	ACTIVE
13	25	1	1	2	\N	ADM-S00023	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:19.495+00	2026-07-04 05:04:19.495+00	\N	ACTIVE
14	26	1	1	2	\N	ADM-S00024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:19.859+00	2026-07-04 05:04:19.859+00	\N	ACTIVE
15	27	1	1	2	\N	ADM-S00025	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:20.223+00	2026-07-04 05:04:20.223+00	\N	ACTIVE
16	28	1	1	2	\N	ADM-S00026	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:20.587+00	2026-07-04 05:04:20.587+00	\N	ACTIVE
17	29	1	1	2	\N	ADM-S00027	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:20.951+00	2026-07-04 05:04:20.951+00	\N	ACTIVE
18	30	1	1	2	\N	ADM-S00028	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:21.315+00	2026-07-04 05:04:21.315+00	\N	ACTIVE
19	31	1	1	2	\N	ADM-S00029	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:21.68+00	2026-07-04 05:04:21.68+00	\N	ACTIVE
20	32	1	1	2	\N	ADM-S00030	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:22.044+00	2026-07-04 05:04:22.044+00	\N	ACTIVE
21	33	1	2	3	\N	ADM-S00041	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:23.681+00	2026-07-04 05:04:23.681+00	\N	ACTIVE
22	34	1	2	3	\N	ADM-S00042	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:24.045+00	2026-07-04 05:04:24.045+00	\N	ACTIVE
23	35	1	2	3	\N	ADM-S00043	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:24.409+00	2026-07-04 05:04:24.409+00	\N	ACTIVE
24	36	1	2	3	\N	ADM-S00044	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:24.773+00	2026-07-04 05:04:24.773+00	\N	ACTIVE
25	37	1	2	3	\N	ADM-S00045	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:25.137+00	2026-07-04 05:04:25.137+00	\N	ACTIVE
26	38	1	2	3	\N	ADM-S00046	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:25.501+00	2026-07-04 05:04:25.501+00	\N	ACTIVE
27	39	1	2	3	\N	ADM-S00047	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:25.865+00	2026-07-04 05:04:25.865+00	\N	ACTIVE
28	40	1	2	3	\N	ADM-S00048	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:26.228+00	2026-07-04 05:04:26.228+00	\N	ACTIVE
29	41	1	2	3	\N	ADM-S00049	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:26.592+00	2026-07-04 05:04:26.592+00	\N	ACTIVE
30	42	1	2	3	\N	ADM-S00050	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:26.956+00	2026-07-04 05:04:26.956+00	\N	ACTIVE
31	43	1	2	4	\N	ADM-S00061	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:28.048+00	2026-07-04 05:04:28.048+00	\N	ACTIVE
32	44	1	2	4	\N	ADM-S00062	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:28.412+00	2026-07-04 05:04:28.412+00	\N	ACTIVE
33	45	1	2	4	\N	ADM-S00063	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:28.776+00	2026-07-04 05:04:28.776+00	\N	ACTIVE
34	46	1	2	4	\N	ADM-S00064	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:29.14+00	2026-07-04 05:04:29.14+00	\N	ACTIVE
35	47	1	2	4	\N	ADM-S00065	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:29.504+00	2026-07-04 05:04:29.504+00	\N	ACTIVE
36	48	1	2	4	\N	ADM-S00066	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:29.868+00	2026-07-04 05:04:29.868+00	\N	ACTIVE
37	49	1	2	4	\N	ADM-S00067	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:30.232+00	2026-07-04 05:04:30.232+00	\N	ACTIVE
38	50	1	2	4	\N	ADM-S00068	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:30.595+00	2026-07-04 05:04:30.595+00	\N	ACTIVE
39	51	1	2	4	\N	ADM-S00069	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:30.959+00	2026-07-04 05:04:30.959+00	\N	ACTIVE
40	52	1	2	4	\N	ADM-S00070	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:31.323+00	2026-07-04 05:04:31.323+00	\N	ACTIVE
1	13	1	1	1	\N	ADM-S00001	2010-07-04	female	ravi	lavanya		test address	A	\N			\N		9898887771	dayscholar	t	approved	2	\N	2026-07-04 05:12:23.558+00	2026-07-04 05:04:14.396+00	2026-07-04 05:12:23.558+00	\N	ACTIVE
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subjects (id, school_id, name, code, category, created_at, updated_at) FROM stdin;
3	1	English	\N	theory	2026-07-04 05:05:36.278+00	2026-07-07 06:14:25.749+00
1	1	Maths	\N	theory	2026-07-04 05:05:26.373+00	2026-07-07 06:14:31.591+00
4	1	Science	\N	theory	2026-07-04 05:05:41.158+00	2026-07-07 06:14:39.033+00
2	1	Tamil	\N	theory	2026-07-04 05:05:30.933+00	2026-07-07 06:14:44.974+00
5	1	Social science	\N	theory	2026-07-04 05:05:47+00	2026-07-07 06:14:50.205+00
\.


--
-- Data for Name: teacher_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teacher_assignments (id, school_id, teacher_id, class_id, section_id, subject_id, is_active, is_class_teacher, created_at, updated_at) FROM stdin;
1	1	1	1	1	\N	t	t	2026-07-04 05:14:53.495+00	2026-07-04 05:14:53.495+00
2	1	1	1	1	3	t	f	2026-07-04 05:14:58.6+00	2026-07-04 05:14:58.6+00
3	1	5	1	2	3	f	f	2026-07-07 04:08:49.927+00	2026-07-07 04:08:51.934+00
4	1	2	1	2	\N	t	t	2026-07-07 04:41:19.026+00	2026-07-07 04:41:19.026+00
5	1	3	2	3	\N	t	t	2026-07-07 04:41:25.221+00	2026-07-07 04:41:25.221+00
6	1	4	2	4	\N	t	t	2026-07-07 04:41:29.833+00	2026-07-07 04:41:29.833+00
7	1	2	1	1	1	t	f	2026-07-07 04:42:26.106+00	2026-07-07 04:42:26.106+00
8	1	3	1	1	4	t	f	2026-07-07 04:42:31.934+00	2026-07-07 04:42:31.934+00
9	1	4	1	1	2	t	f	2026-07-07 04:42:36.305+00	2026-07-07 04:42:36.305+00
10	1	6	1	1	5	t	f	2026-07-07 04:42:44.755+00	2026-07-07 04:42:44.755+00
\.


--
-- Data for Name: teacher_class_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teacher_class_sessions (id, school_id, teacher_assignment_id, teacher_id, class_id, section_id, timetable_id, started_at, ended_at, created_at, updated_at) FROM stdin;
1	1	2	1	1	1	\N	2026-07-04 05:28:42.746+00	2026-07-04 05:29:03.861+00	2026-07-04 05:28:42.746+00	2026-07-04 05:29:03.861+00
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teachers (id, user_id, school_id, employee_id, gender, designation, qualification, joining_date, experience, approval_status, is_active, approved_by, rejection_reason, approved_at, created_at, updated_at, status) FROM stdin;
2	4	1	EMP-T00002	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:09.833+00	2026-07-04 05:04:09.833+00	ACTIVE
3	5	1	EMP-T00003	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:10.198+00	2026-07-04 05:04:10.198+00	ACTIVE
4	6	1	EMP-T00004	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:10.562+00	2026-07-04 05:04:10.562+00	ACTIVE
5	7	1	EMP-T00005	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:10.926+00	2026-07-04 05:04:10.926+00	ACTIVE
6	8	1	EMP-T00006	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:11.29+00	2026-07-04 05:04:11.29+00	ACTIVE
7	9	1	EMP-T00007	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:11.655+00	2026-07-04 05:04:11.655+00	ACTIVE
8	10	1	EMP-T00008	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:12.019+00	2026-07-04 05:04:12.019+00	ACTIVE
9	11	1	EMP-T00009	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:12.383+00	2026-07-04 05:04:12.383+00	ACTIVE
10	12	1	EMP-T00010	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:12.747+00	2026-07-04 05:04:12.747+00	ACTIVE
1	3	1	EMP-T00001	male	Teacher	BA	2026-07-04	2	approved	t	2	\N	2026-07-04 05:08:28.526+00	2026-07-04 05:04:09.466+00	2026-07-04 05:08:28.526+00	ACTIVE
\.


--
-- Data for Name: timetables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.timetables (id, school_id, class_id, section_id, day_of_week, start_time, end_time, teacher_assignment_id, title, is_break, created_at, updated_at, academic_year_id) FROM stdin;
26	1	1	1	tuesday	18:00:00	18:45:00	2	\N	f	2026-07-07 06:53:41.291+00	2026-07-07 06:53:41.291+00	1
27	1	1	1	tuesday	12:00:00	13:30:00	7	\N	f	2026-07-07 06:53:41.658+00	2026-07-07 06:53:41.658+00	1
28	1	1	1	tuesday	17:00:00	17:35:00	8	\N	f	2026-07-07 06:53:42.024+00	2026-07-07 06:53:42.024+00	1
29	1	1	1	tuesday	10:00:00	10:30:00	9	\N	f	2026-07-07 06:53:42.389+00	2026-07-07 06:53:42.389+00	1
30	1	1	1	monday	09:00:00	10:00:00	9	\N	f	2026-07-07 14:20:30.801+00	2026-07-07 14:20:30.801+00	1
31	1	1	1	monday	10:52:00	12:53:00	8	\N	f	2026-07-07 14:20:31.119+00	2026-07-07 14:20:31.119+00	1
32	1	1	1	monday	13:53:00	14:53:00	2	\N	f	2026-07-07 14:20:31.434+00	2026-07-07 14:20:31.434+00	1
33	1	1	1	monday	15:53:00	16:53:00	10	\N	f	2026-07-07 14:20:31.749+00	2026-07-07 14:20:31.749+00	1
34	1	1	1	wednesday	18:00:00	18:45:00	2	\N	f	2026-07-07 14:21:20.909+00	2026-07-07 14:21:20.909+00	1
35	1	1	1	wednesday	19:54:00	20:54:00	7	\N	f	2026-07-07 14:21:21.225+00	2026-07-07 14:21:21.225+00	1
36	1	1	1	wednesday	20:54:00	21:54:00	8	\N	f	2026-07-07 14:21:21.541+00	2026-07-07 14:21:21.541+00	1
37	1	1	1	wednesday	21:54:00	22:54:00	10	\N	f	2026-07-07 14:21:21.856+00	2026-07-07 14:21:21.856+00	1
38	1	1	1	thursday	18:00:00	18:45:00	2	\N	f	2026-07-07 14:22:14.974+00	2026-07-07 14:22:14.974+00	1
39	1	1	1	thursday	19:55:00	20:55:00	9	\N	f	2026-07-07 14:22:15.317+00	2026-07-07 14:22:15.317+00	1
40	1	1	1	thursday	20:55:00	21:55:00	8	\N	f	2026-07-07 14:22:15.659+00	2026-07-07 14:22:15.659+00	1
41	1	1	1	thursday	21:55:00	22:55:00	7	\N	f	2026-07-07 14:22:16.007+00	2026-07-07 14:22:16.007+00	1
42	1	1	1	friday	18:00:00	18:45:00	2	\N	f	2026-07-07 14:23:06.5+00	2026-07-07 14:23:06.5+00	1
43	1	1	1	friday	19:55:00	20:56:00	7	\N	f	2026-07-07 14:23:06.817+00	2026-07-07 14:23:06.817+00	1
44	1	1	1	friday	20:56:00	21:56:00	8	\N	f	2026-07-07 14:23:07.133+00	2026-07-07 14:23:07.133+00	1
45	1	1	1	friday	21:56:00	22:56:00	10	\N	f	2026-07-07 14:23:07.45+00	2026-07-07 14:23:07.45+00	1
46	1	1	1	saturday	18:00:00	18:45:00	2	\N	f	2026-07-07 14:24:40.575+00	2026-07-07 14:24:40.575+00	1
47	1	1	1	saturday	19:56:00	20:56:00	7	\N	f	2026-07-07 14:24:40.892+00	2026-07-07 14:24:40.892+00	1
48	1	1	1	saturday	20:56:00	21:56:00	9	\N	f	2026-07-07 14:24:41.208+00	2026-07-07 14:24:41.208+00	1
49	1	1	1	saturday	21:57:00	22:58:00	10	\N	f	2026-07-07 14:24:41.525+00	2026-07-07 14:24:41.525+00	1
\.


--
-- Data for Name: token_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.token_accounts (id, user_id, balance, expires_at, created_at, updated_at) FROM stdin;
2	13	96588	\N	2026-07-04 05:12:38.066+00	2026-07-07 17:11:50.93+00
1	3	94051	\N	2026-07-04 05:09:13.981+00	2026-07-08 04:17:38.464+00
\.


--
-- Data for Name: token_policies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.token_policies (id, role, monthly_tokens, updated_by, created_at, updated_at) FROM stdin;
1	student	99999	1	2026-07-04 04:56:07.554+00	2026-07-04 04:59:00.65+00
3	teacher	99999	1	2026-07-04 04:56:07.925+00	2026-07-04 04:59:01.018+00
\.


--
-- Data for Name: token_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.token_transactions (id, user_id, type, change, balance_before, balance_after, created_at, updated_at) FROM stdin;
1	3	admin_adjustment	99999	0	99999	2026-07-04 05:09:14.161+00	2026-07-04 05:09:14.161+00
2	13	admin_adjustment	99999	0	99999	2026-07-04 05:12:38.25+00	2026-07-04 05:12:38.25+00
3	3	usage	-2592	99999	97407	2026-07-04 05:32:19.699+00	2026-07-04 05:32:19.699+00
4	13	usage	-46	99999	99953	2026-07-04 07:12:13.383+00	2026-07-04 07:12:13.383+00
5	13	usage	-108	99953	99845	2026-07-04 07:13:02.052+00	2026-07-04 07:13:02.052+00
6	13	usage	-452	99845	99393	2026-07-04 08:16:34.967+00	2026-07-04 08:16:34.967+00
7	3	usage	-679	97407	96728	2026-07-07 05:11:48.677+00	2026-07-07 05:11:48.677+00
8	3	usage	-1066	96728	95662	2026-07-07 05:12:49.162+00	2026-07-07 05:12:49.162+00
9	13	usage	-54	99393	99339	2026-07-07 05:15:19.706+00	2026-07-07 05:15:19.706+00
10	13	usage	-789	99339	98550	2026-07-07 05:17:23.581+00	2026-07-07 05:17:23.581+00
11	13	usage	-63	98550	98487	2026-07-07 14:29:50.889+00	2026-07-07 14:29:50.889+00
12	13	usage	-59	98487	98428	2026-07-07 14:31:07.642+00	2026-07-07 14:31:07.642+00
13	13	usage	-80	98428	98348	2026-07-07 14:31:53.726+00	2026-07-07 14:31:53.726+00
14	13	usage	-68	98348	98280	2026-07-07 14:33:45.084+00	2026-07-07 14:33:45.084+00
15	3	usage	-738	95662	94924	2026-07-07 14:52:12.998+00	2026-07-07 14:52:12.998+00
16	13	usage	-441	98280	97839	2026-07-07 17:08:48.426+00	2026-07-07 17:08:48.426+00
17	13	usage	-218	97839	97621	2026-07-07 17:09:59.204+00	2026-07-07 17:09:59.204+00
18	13	usage	-691	97621	96930	2026-07-07 17:10:29.518+00	2026-07-07 17:10:29.518+00
19	13	usage	-342	96930	96588	2026-07-07 17:11:51.088+00	2026-07-07 17:11:51.088+00
20	3	usage	-873	94924	94051	2026-07-08 04:17:38.623+00	2026-07-08 04:17:38.623+00
\.


--
-- Data for Name: transport_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transport_requests (id, school_id, student_id, current_vehicle_id, requested_vehicle_id, pickup_point, status, approved_by, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: trip_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trip_locations (id, trip_id, latitude, longitude, speed, heading, created_at) FROM stdin;
1	1	11.24433050	77.50717900	\N	\N	2026-07-04 05:23:06.312+00
2	1	11.24385550	77.50811668	\N	\N	2026-07-04 05:24:46.537+00
3	1	11.24470307	77.50692924	\N	\N	2026-07-04 05:24:58.928+00
4	1	11.24401975	77.50679439	\N	\N	2026-07-04 05:25:11.567+00
5	1	11.24433050	77.50717900	\N	\N	2026-07-04 05:25:26.097+00
6	1	11.24401975	77.50679439	\N	\N	2026-07-04 05:25:30.752+00
7	2	11.24839100	77.50765700	\N	\N	2026-07-05 14:45:07.937+00
8	2	11.24398550	77.50675200	\N	\N	2026-07-05 14:45:43.204+00
9	2	11.24401975	77.50679439	\N	\N	2026-07-05 14:45:48.14+00
10	3	11.19812010	76.96118780	\N	\N	2026-07-07 04:59:41.263+00
11	4	11.19811910	76.96118140	0.1847550764679909	\N	2026-07-07 05:00:06.018+00
12	4	11.19811930	76.96117850	0.1143464595079422	\N	2026-07-07 05:00:14.478+00
13	4	11.19811670	76.96118090	0.14108306765556336	\N	2026-07-07 05:00:24.96+00
14	4	11.19811670	76.96118090	0.1419866368174553	\N	2026-07-07 05:00:25.122+00
15	4	11.19811830	76.96117840	0.17055998146533966	\N	2026-07-07 05:00:25.951+00
16	4	11.19811820	76.96117840	0.010756152682006359	\N	2026-07-07 05:00:34.365+00
17	4	11.19811930	76.96117660	0.07897354066371919	\N	2026-07-07 05:00:44.949+00
18	4	11.19811430	76.96118280	0.33331363499164585	\N	2026-07-07 05:01:06.987+00
19	4	11.19812260	76.96118550	0.34015198051929474	\N	2026-07-07 05:01:16.499+00
20	4	11.19838720	76.96114600	\N	\N	2026-07-07 05:02:25.975+00
21	4	11.19838720	76.96114600	\N	\N	2026-07-07 05:02:33.279+00
22	4	11.19838720	76.96114600	\N	\N	2026-07-07 05:02:36.657+00
23	5	11.19811720	76.96117580	\N	\N	2026-07-07 05:27:17.321+00
24	5	11.19811560	76.96117320	0.10789599493145943	\N	2026-07-07 05:27:27.459+00
25	6	11.24454020	77.50790990	\N	\N	2026-07-07 06:21:24.458+00
26	6	11.24460620	77.50785550	1.2846030235290529	31.401111602783203	2026-07-07 06:21:25.507+00
27	6	11.24457770	77.50786030	0.7598270595073701	48.92948913574219	2026-07-07 06:21:26.404+00
28	6	11.24455670	77.50785130	0.32381145358085633	\N	2026-07-07 06:21:27.401+00
29	6	11.24454180	77.50784370	0.18749299496412278	\N	2026-07-07 06:21:28.359+00
30	6	11.24452890	77.50783770	0.41752467155456546	42.12781524658203	2026-07-07 06:21:29.402+00
31	6	11.24451650	77.50783950	0.09921420067548752	\N	2026-07-07 06:21:30.455+00
32	6	11.24451710	77.50784100	0.10548704266548158	\N	2026-07-07 06:21:31.708+00
33	6	11.24451760	77.50784240	0.11335009932518006	\N	2026-07-07 06:21:31.731+00
34	6	11.24451740	77.50784790	1.252497947216034	88.26882934570312	2026-07-07 06:21:32.314+00
35	6	11.24451680	77.50784930	0.5031356871128082	89.59896087646484	2026-07-07 06:21:32.93+00
36	6	11.24451650	77.50785000	0.4497244566679001	89.90311431884766	2026-07-07 06:21:33.552+00
37	6	11.24451990	77.50784750	0.4819235444068909	89.8408203125	2026-07-07 06:21:34.282+00
38	6	11.24452150	77.50784650	0.4860955595970154	89.88501739501953	2026-07-07 06:21:34.721+00
39	6	11.24452710	77.50784230	0.5419044971466065	89.79473114013672	2026-07-07 06:21:36.079+00
40	6	11.24453280	77.50783880	0.45113795399665835	355.8320617675781	2026-07-07 06:21:36.993+00
41	6	11.24453940	77.50783500	0.49023506641387943	356.34326171875	2026-07-07 06:21:37.963+00
42	6	11.24454400	77.50783350	0.4570442855358124	359.64569091796875	2026-07-07 06:21:38.388+00
43	6	11.24454600	77.50783290	0.4553381323814392	1.9778000116348267	2026-07-07 06:21:38.966+00
44	6	11.24455040	77.50783090	0.48280078768730167	3.682149887084961	2026-07-07 06:21:39.955+00
45	6	11.24455500	77.50782880	0.4452956199645996	358.946533203125	2026-07-07 06:21:40.914+00
46	6	11.24455040	77.50782980	0.42620518505573274	339.5804138183594	2026-07-07 06:21:41.692+00
47	6	11.24454040	77.50783200	0.4399776577949524	88.57982635498047	2026-07-07 06:21:49.043+00
48	6	11.24453750	77.50783290	0.5909885466098785	89.87544250488281	2026-07-07 06:21:50.213+00
49	6	11.24453660	77.50783330	0.6063206970691681	90.02922821044922	2026-07-07 06:21:51.201+00
50	6	11.24453380	77.50783420	0.7204884409904481	90.1869888305664	2026-07-07 06:21:52.937+00
51	6	11.24453090	77.50783470	0.6497544586658478	90.31868743896484	2026-07-07 06:21:53.973+00
52	6	11.24451720	77.50783600	0.5486392557621003	193.32009887695312	2026-07-07 06:21:55.032+00
53	6	11.24450530	77.50783270	0.5848355054855346	197.34791564941406	2026-07-07 06:21:55.787+00
54	7	11.24448270	77.50782350	0.4561696171760559	91.48934936523438	2026-07-07 06:22:06.392+00
55	7	11.24446630	77.50782240	0.02603283002972603	\N	2026-07-07 06:22:08.475+00
56	7	11.24446900	77.50782060	0.0022857257165014746	\N	2026-07-07 06:22:09.462+00
57	7	11.24447100	77.50781900	0.015927258878946304	\N	2026-07-07 06:22:11.023+00
58	5	11.24449740	77.50788610	\N	\N	2026-07-07 06:27:31.472+00
59	5	11.24450640	77.50791870	0.2622064769268036	\N	2026-07-07 06:27:38.611+00
60	5	11.24453280	77.50791470	0.6868856191635132	3.6015453338623047	2026-07-07 06:27:45.837+00
61	5	11.24455800	77.50785610	0.5373646438121796	359.99993896484375	2026-07-07 06:27:53.509+00
62	5	11.24455840	77.50785580	0.5364821434020997	359.99993896484375	2026-07-07 06:27:53.535+00
63	5	11.24456070	77.50784610	0.3962582141160965	359.9999694824219	2026-07-07 06:27:53.884+00
64	5	11.24456580	77.50783930	0.40635721385478973	\N	2026-07-07 06:27:54.846+00
65	5	11.24456660	77.50784080	0.2874216288328171	\N	2026-07-07 06:27:55.735+00
66	5	11.24456580	77.50784230	0.17731547355651855	\N	2026-07-07 06:27:56.725+00
67	5	11.24456020	77.50784390	0.0005042719538323582	\N	2026-07-07 06:27:57.812+00
68	5	11.24455370	77.50784460	0.12061348110437393	\N	2026-07-07 06:27:59.068+00
69	5	11.24453480	77.50784700	0.3900199860334396	180	2026-07-07 06:27:59.807+00
70	5	11.24452350	77.50785010	0.40027026236057284	180	2026-07-07 06:28:00.698+00
71	5	11.24451310	77.50785110	0.37615618407726287	180	2026-07-07 06:28:01.738+00
72	5	11.24451180	77.50785120	0.3831637233495712	180	2026-07-07 06:28:02.695+00
73	5	11.24457410	77.50779020	0.6174152791500092	359.9997863769531	2026-07-07 06:28:03.719+00
74	5	11.24458670	77.50777750	0.48530988693237304	\N	2026-07-07 06:28:04.833+00
75	5	11.24459050	77.50777350	0.3206930369138718	\N	2026-07-07 06:28:05.761+00
76	5	11.24459050	77.50777260	0.3082503229379654	\N	2026-07-07 06:28:06.753+00
77	5	11.24458990	77.50777180	1.4202292442321778	82.79510498046875	2026-07-07 06:28:07.732+00
78	5	11.24459140	77.50777190	0.6266400396823884	87.96259307861328	2026-07-07 06:28:08.831+00
79	5	11.24459160	77.50777180	0.6960631728172303	89.42266082763672	2026-07-07 06:28:09.731+00
80	5	11.24459160	77.50777150	0.6598885416984558	89.74219512939453	2026-07-07 06:28:10.015+00
81	5	11.24459150	77.50777150	0.6517268478870392	89.92085266113281	2026-07-07 06:28:10.757+00
82	5	11.24459170	77.50777160	0.6892352879047394	89.9681625366211	2026-07-07 06:28:11.734+00
83	5	11.24459210	77.50777190	0.561055201292038	89.95454406738281	2026-07-07 06:28:12.724+00
84	5	11.24459250	77.50777140	0.4684804201126099	89.97183990478516	2026-07-07 06:28:13.758+00
85	5	11.24459230	77.50777120	0.49190688729286197	90.00030517578125	2026-07-07 06:28:14.716+00
86	5	11.24459240	77.50777120	0.4697983503341675	89.99832916259766	2026-07-07 06:28:16.066+00
87	5	11.24459250	77.50777140	0.49217070937156676	89.99250793457031	2026-07-07 06:28:17.019+00
88	5	11.24459280	77.50777120	0.43500505685806273	129.0885772705078	2026-07-07 06:28:17.91+00
89	5	11.24459240	77.50777150	0.43590979278087616	127.80897521972656	2026-07-07 06:28:18.95+00
90	5	11.24459230	77.50777180	0.5262459218502045	120.65479278564453	2026-07-07 06:28:19.935+00
91	5	11.24459250	77.50777190	0.47932314276695254	116.68006896972656	2026-07-07 06:28:20.929+00
92	5	11.24459280	77.50777210	0.48566511869430545	106.11566162109375	2026-07-07 06:28:22.075+00
93	5	11.24459290	77.50777220	0.5288005113601685	104.89324188232422	2026-07-07 06:28:22.954+00
95	5	11.24459250	77.50777290	0.20626939684152604	\N	2026-07-07 06:28:24.331+00
94	5	11.24459290	77.50777280	0.4857488036155701	108.5102310180664	2026-07-07 06:28:23.937+00
96	5	11.24459240	77.50777280	0.19928772747516632	\N	2026-07-07 06:28:25.013+00
97	5	11.24459200	77.50777290	0.16070594787597656	\N	2026-07-07 06:28:25.93+00
98	5	11.24459180	77.50777270	0.12335005849599838	\N	2026-07-07 06:28:26.965+00
99	5	11.24444750	77.50772550	0.15241764038801195	\N	2026-07-07 06:28:28.04+00
103	5	11.24439230	77.50770750	0.12721108496189118	\N	2026-07-07 06:28:31.556+00
100	5	11.24440700	77.50771270	0.12349048554897309	\N	2026-07-07 06:28:28.933+00
101	5	11.24439580	77.50770870	0.1163496270775795	\N	2026-07-07 06:28:29.931+00
102	5	11.24439280	77.50770760	0.11881681680679322	\N	2026-07-07 06:28:31.052+00
104	5	11.24439210	77.50770740	0.12971491366624832	\N	2026-07-07 06:28:31.962+00
105	5	11.24439220	77.50770740	0.15857664942741395	\N	2026-07-07 06:28:32.954+00
106	5	11.24439220	77.50770740	0.12036197036504746	\N	2026-07-07 06:28:34.056+00
107	5	11.24439220	77.50770730	0.16098959147930145	\N	2026-07-07 06:28:34.93+00
108	5	11.24439210	77.50770740	0.13459527343511582	\N	2026-07-07 06:28:35.931+00
109	5	11.24439230	77.50770720	0.12764037251472474	\N	2026-07-07 06:28:36.924+00
110	5	11.24439210	77.50770720	0.15254512578248977	\N	2026-07-07 06:28:37.917+00
111	5	11.24439220	77.50770730	0.15017503201961518	\N	2026-07-07 06:28:38.722+00
112	5	11.24439220	77.50770730	0.15222126245498657	\N	2026-07-07 06:28:38.957+00
113	5	11.24439230	77.50770750	0.12288913428783417	\N	2026-07-07 06:28:40.026+00
114	5	11.24439230	77.50770760	0.1836455136537552	\N	2026-07-07 06:28:40.936+00
115	5	11.24439220	77.50770760	0.148112453520298	\N	2026-07-07 06:28:41.932+00
116	5	11.24439210	77.50770750	0.1319096714258194	\N	2026-07-07 06:28:42.941+00
117	5	11.24439210	77.50770740	0.11486592292785645	\N	2026-07-07 06:28:43.92+00
118	5	11.24439220	77.50770750	0.1437655583024025	\N	2026-07-07 06:28:44.938+00
119	5	11.24439220	77.50770750	0.13368206173181535	\N	2026-07-07 06:28:46+00
120	5	11.24439240	77.50770750	0.14000791758298875	\N	2026-07-07 06:28:46.938+00
121	5	11.24439250	77.50770760	0.14190057814121246	\N	2026-07-07 06:28:48.06+00
122	5	11.24439270	77.50770760	0.14975507855415346	\N	2026-07-07 06:28:48.957+00
123	5	11.24439290	77.50770760	0.1493525192141533	\N	2026-07-07 06:28:49.937+00
124	5	11.24439310	77.50770760	0.11970575451850891	\N	2026-07-07 06:28:50.923+00
125	5	11.24439310	77.50770780	0.13954067677259446	\N	2026-07-07 06:28:52.018+00
126	5	11.24439330	77.50770770	0.15612262934446336	\N	2026-07-07 06:28:52.92+00
127	5	11.24439340	77.50770760	0.12857388854026794	\N	2026-07-07 06:28:53.932+00
128	5	11.24439360	77.50770760	0.15402090400457383	\N	2026-07-07 06:28:54.915+00
129	5	11.24439360	77.50770750	0.1453396797180176	\N	2026-07-07 06:28:55.94+00
130	5	11.24439370	77.50770740	0.13000590652227403	\N	2026-07-07 06:28:57.636+00
131	5	11.24439370	77.50770760	0.1422304630279541	\N	2026-07-07 06:28:58.363+00
132	5	11.24439380	77.50770780	0.1467275083065033	\N	2026-07-07 06:28:59.288+00
133	5	11.24439370	77.50770820	0.17187222540378572	\N	2026-07-07 06:29:00.282+00
134	5	11.24439370	77.50770810	0.156346794962883	\N	2026-07-07 06:29:00.736+00
135	5	11.24439380	77.50770820	0.15782651603221895	\N	2026-07-07 06:29:01.285+00
136	5	11.24439380	77.50770830	0.1696920320391655	\N	2026-07-07 06:29:01.972+00
137	5	11.24439370	77.50770830	0.17616365253925323	\N	2026-07-07 06:29:02.94+00
138	5	11.24439360	77.50770850	0.16313323974609376	\N	2026-07-07 06:29:04.058+00
139	5	11.24439340	77.50770860	0.11392952352762223	\N	2026-07-07 06:29:04.955+00
140	5	11.24439330	77.50770860	0.12472674250602722	\N	2026-07-07 06:29:06.033+00
141	5	11.24439320	77.50770860	0.10500398352742195	\N	2026-07-07 06:29:06.956+00
142	5	11.24439320	77.50770860	0.11602372527122498	\N	2026-07-07 06:29:07.926+00
143	5	11.24439320	77.50770870	0.1588359519839287	\N	2026-07-07 06:29:08.962+00
144	5	11.24439330	77.50770870	0.142373988032341	\N	2026-07-07 06:29:10.038+00
145	5	11.24439340	77.50770880	0.17463211119174957	\N	2026-07-07 06:29:10.92+00
146	5	11.24439350	77.50770880	0.1366567388176918	\N	2026-07-07 06:29:11.941+00
147	5	11.24439350	77.50770850	0.12218054831027984	\N	2026-07-07 06:29:12.96+00
148	5	11.24439370	77.50770840	0.15598287284374238	\N	2026-07-07 06:29:13.943+00
149	5	11.24439380	77.50770850	0.14734064787626266	\N	2026-07-07 06:29:14.435+00
150	5	11.24439390	77.50770860	0.14948201626539231	\N	2026-07-07 06:29:14.924+00
151	5	11.24439400	77.50770850	0.1327197790145874	\N	2026-07-07 06:29:16.083+00
152	5	11.24439410	77.50770850	0.14931335896253586	\N	2026-07-07 06:29:16.937+00
153	5	11.24439430	77.50770870	0.12708244621753692	\N	2026-07-07 06:29:18.15+00
154	5	11.24439430	77.50770880	0.1460166960954666	\N	2026-07-07 06:29:18.916+00
155	5	11.24439440	77.50770880	0.1161723867058754	\N	2026-07-07 06:29:19.928+00
156	5	11.24439460	77.50770870	0.14461974799633026	\N	2026-07-07 06:29:20.958+00
157	5	11.24439460	77.50770860	0.13912658393383026	\N	2026-07-07 06:29:21.737+00
158	5	11.24439460	77.50770850	0.14131797552108766	\N	2026-07-07 06:29:21.919+00
159	5	11.24439470	77.50770870	0.14587870985269547	\N	2026-07-07 06:29:22.959+00
160	5	11.24439470	77.50770900	0.1393659844994545	\N	2026-07-07 06:29:23.941+00
161	5	11.24439470	77.50770920	0.14365360289812087	\N	2026-07-07 06:29:24.951+00
162	5	11.24439470	77.50770920	0.12737703323364258	\N	2026-07-07 06:29:25.94+00
163	5	11.24439470	77.50770910	0.130135577917099	\N	2026-07-07 06:29:26.995+00
164	5	11.24439470	77.50770890	0.1264932319521904	\N	2026-07-07 06:29:27.921+00
165	5	11.24439460	77.50770880	0.14946574866771697	\N	2026-07-07 06:29:28.856+00
166	5	11.24439510	77.50770950	0.1351971745491028	\N	2026-07-07 06:29:29.923+00
167	5	11.24439570	77.50771030	0.14764924943447114	\N	2026-07-07 06:29:30.946+00
168	5	11.24439640	77.50771130	0.11803670972585678	\N	2026-07-07 06:29:31.927+00
169	5	11.24439680	77.50771250	0.15208461731672288	\N	2026-07-07 06:29:33.045+00
170	5	11.24439740	77.50771400	0.1357160747051239	\N	2026-07-07 06:29:33.94+00
171	5	11.24439790	77.50771550	0.13561767786741258	\N	2026-07-07 06:29:34.939+00
172	5	11.24439850	77.50771690	0.13777493834495544	\N	2026-07-07 06:29:35.972+00
173	5	11.24439940	77.50771840	0.1442281186580658	\N	2026-07-07 06:29:36.961+00
174	5	11.24440010	77.50771960	0.18657908588647842	\N	2026-07-07 06:29:37.963+00
175	5	11.24440120	77.50772140	0.15788669139146805	\N	2026-07-07 06:29:39.059+00
176	5	11.24440280	77.50772320	0.13524813652038575	\N	2026-07-07 06:29:40.077+00
177	5	11.24440440	77.50772480	0.15173175930976868	\N	2026-07-07 06:29:41.014+00
178	5	11.24440550	77.50772660	0.18199836909770967	\N	2026-07-07 06:29:41.961+00
179	5	11.24440670	77.50772810	0.15373158752918245	\N	2026-07-07 06:29:42.938+00
180	5	11.24440740	77.50772920	0.13785801976919174	\N	2026-07-07 06:29:43.294+00
181	5	11.24440770	77.50772980	0.13939582407474518	\N	2026-07-07 06:29:43.908+00
182	5	11.24440870	77.50773120	0.12911683470010757	\N	2026-07-07 06:29:45.02+00
183	5	11.24440950	77.50773290	0.15684987008571624	\N	2026-07-07 06:29:45.939+00
184	5	11.24441040	77.50773440	0.16594274640083315	\N	2026-07-07 06:29:46.941+00
185	5	11.24441130	77.50773560	0.13728217631578446	\N	2026-07-07 06:29:47.948+00
186	5	11.24441180	77.50773660	0.1454363465309143	\N	2026-07-07 06:29:48.926+00
187	5	11.24441240	77.50773750	0.14011956453323365	\N	2026-07-07 06:29:49.919+00
188	5	11.24441310	77.50773870	0.15943675339221955	\N	2026-07-07 06:29:51.04+00
189	5	11.24441370	77.50773960	0.15877485126256943	\N	2026-07-07 06:29:51.938+00
190	5	11.24441430	77.50774060	0.1357418641448021	\N	2026-07-07 06:29:52.942+00
191	5	11.24441470	77.50774150	0.113053098320961	\N	2026-07-07 06:29:53.995+00
192	5	11.24441490	77.50774250	0.15371014326810836	\N	2026-07-07 06:29:54.942+00
193	5	11.24441420	77.50774500	0.14584318399429322	\N	2026-07-07 06:29:55.963+00
194	5	11.24441360	77.50774770	0.14645223319530487	\N	2026-07-07 06:29:57.395+00
195	5	11.24441340	77.50774890	0.1588947594165802	\N	2026-07-07 06:29:57.784+00
196	5	11.24441320	77.50775060	0.18022992163896562	\N	2026-07-07 06:29:58.305+00
197	5	11.24441330	77.50775190	0.1379764661192894	\N	2026-07-07 06:29:58.958+00
198	5	11.24441350	77.50775320	0.13753091096878053	\N	2026-07-07 06:29:59.959+00
199	5	11.24441330	77.50775470	0.13252266347408295	\N	2026-07-07 06:30:00.994+00
200	5	11.24441270	77.50775680	0.12489576190710068	\N	2026-07-07 06:30:01.954+00
201	5	11.24441180	77.50775910	0.14251386523246765	\N	2026-07-07 06:30:03.057+00
203	5	11.24440930	77.50776290	0.11661874651908875	\N	2026-07-07 06:30:04.612+00
208	5	11.24440490	77.50777070	0.12940560132265091	\N	2026-07-07 06:30:09.121+00
202	5	11.24441050	77.50776120	0.18685429394245148	\N	2026-07-07 06:30:03.956+00
204	5	11.24440890	77.50776340	0.11798389703035354	\N	2026-07-07 06:30:04.961+00
205	5	11.24440790	77.50776500	0.1306845188140869	\N	2026-07-07 06:30:05.958+00
206	5	11.24440690	77.50776690	0.13996678590774536	\N	2026-07-07 06:30:06.956+00
207	5	11.24440600	77.50776880	0.16423254311084748	\N	2026-07-07 06:30:07.941+00
209	5	11.24440320	77.50777320	0.10174248442053795	\N	2026-07-07 06:30:09.949+00
210	5	11.24440060	77.50777640	0.11882777363061905	\N	2026-07-07 06:30:10.938+00
211	5	11.24439860	77.50777880	0.10838756337761879	\N	2026-07-07 06:30:11.897+00
212	5	11.24439700	77.50778060	0.15565622001886367	\N	2026-07-07 06:30:12.956+00
213	5	11.24439610	77.50778190	0.14069940447807314	\N	2026-07-07 06:30:13.957+00
214	5	11.24439550	77.50778340	0.13073014318943024	\N	2026-07-07 06:30:15.055+00
215	5	11.24439550	77.50778560	0.1483322873711586	\N	2026-07-07 06:30:15.977+00
216	5	11.24439550	77.50778830	0.13603960275650026	\N	2026-07-07 06:30:16.954+00
217	5	11.24439560	77.50779080	0.15769074261188507	\N	2026-07-07 06:30:17.962+00
218	5	11.24439580	77.50779260	0.15179927051067352	\N	2026-07-07 06:30:18.72+00
219	5	11.24439590	77.50779310	0.1517043873667717	\N	2026-07-07 06:30:18.956+00
220	5	11.24439600	77.50779430	0.13210222721099854	\N	2026-07-07 06:30:19.936+00
221	5	11.24439610	77.50779540	0.13299058824777604	\N	2026-07-07 06:30:21.04+00
222	5	11.24439610	77.50779640	0.156911963224411	\N	2026-07-07 06:30:21.955+00
223	5	11.24439600	77.50779730	0.1443951666355133	\N	2026-07-07 06:30:22.957+00
224	5	11.24439590	77.50779830	0.16259289532899857	\N	2026-07-07 06:30:23.957+00
225	5	11.24439600	77.50779910	0.1266346514225006	\N	2026-07-07 06:30:24.962+00
226	5	11.24439610	77.50779980	0.13892360776662827	\N	2026-07-07 06:30:25.936+00
227	5	11.24439610	77.50780070	0.1604676738381386	\N	2026-07-07 06:30:27.077+00
228	5	11.24439600	77.50780150	0.12421470880508423	\N	2026-07-07 06:30:27.963+00
229	5	11.24439600	77.50780190	0.14660569578409197	\N	2026-07-07 06:30:28.957+00
230	5	11.24439610	77.50780260	0.13073942363262178	\N	2026-07-07 06:30:29.976+00
231	5	11.24439620	77.50780330	0.1451349601149559	\N	2026-07-07 06:30:30.957+00
232	5	11.24439610	77.50780390	0.1435052365064621	\N	2026-07-07 06:30:31.974+00
233	5	11.24439620	77.50780440	0.13542223870754241	\N	2026-07-07 06:30:33.055+00
234	5	11.24439590	77.50780510	0.15154794752597808	\N	2026-07-07 06:30:33.974+00
235	5	11.24439590	77.50780600	0.125397227704525	\N	2026-07-07 06:30:34.961+00
236	5	11.24439590	77.50780690	0.14597333818674088	\N	2026-07-07 06:30:35.957+00
237	5	11.24439590	77.50780750	0.1574505776166916	\N	2026-07-07 06:30:36.96+00
238	5	11.24439580	77.50780810	0.1530700206756592	\N	2026-07-07 06:30:37.956+00
239	5	11.24439590	77.50780840	0.1381305053830147	\N	2026-07-07 06:30:39.601+00
240	5	11.24439570	77.50780880	0.15799317508935928	\N	2026-07-07 06:30:40.332+00
241	5	11.24439580	77.50780910	0.14823043048381807	\N	2026-07-07 06:30:40.428+00
242	5	11.24439590	77.50780920	0.14980475306510926	\N	2026-07-07 06:30:41.189+00
243	5	11.24439590	77.50780960	0.1754862740635872	\N	2026-07-07 06:30:41.974+00
244	5	11.24439600	77.50781000	0.10719109028577804	\N	2026-07-07 06:30:42.959+00
245	5	11.24439600	77.50781030	0.14146540313959122	\N	2026-07-07 06:30:43.96+00
246	5	11.24439610	77.50781060	0.15155395567417146	\N	2026-07-07 06:30:45.056+00
247	5	11.24439630	77.50781090	0.1495525985956192	\N	2026-07-07 06:30:45.989+00
248	5	11.24439620	77.50781110	0.17127100825309755	\N	2026-07-07 06:30:46.989+00
249	5	11.24439610	77.50781120	0.15001008957624437	\N	2026-07-07 06:30:47.601+00
250	5	11.24439610	77.50781130	0.150922429561615	\N	2026-07-07 06:30:47.988+00
251	5	11.24439600	77.50781140	0.15709880590438843	\N	2026-07-07 06:30:48.987+00
252	5	11.24439600	77.50781170	0.16135718822479247	\N	2026-07-07 06:30:49.976+00
253	5	11.24439590	77.50781170	0.14967781752347947	\N	2026-07-07 06:30:51.094+00
254	5	11.24439580	77.50781200	0.16902652233839036	\N	2026-07-07 06:30:51.96+00
255	5	11.24439580	77.50781230	0.1896134689450264	\N	2026-07-07 06:30:52.956+00
256	5	11.24439600	77.50781250	0.11632885336875916	\N	2026-07-07 06:30:53.941+00
257	5	11.24439610	77.50781250	0.13385022282600403	\N	2026-07-07 06:30:54.824+00
258	5	11.24439620	77.50781270	0.1509458988904953	\N	2026-07-07 06:30:55.952+00
259	5	11.24439620	77.50781290	0.17963907122612	\N	2026-07-07 06:30:57.052+00
260	5	11.24439630	77.50781290	0.16232429891824723	\N	2026-07-07 06:30:57.915+00
261	5	11.24439660	77.50781290	0.14901439994573593	\N	2026-07-07 06:30:58.92+00
262	5	11.24439660	77.50781310	0.1780610203742981	\N	2026-07-07 06:30:59.959+00
263	5	11.24439670	77.50781300	0.14450926780700685	\N	2026-07-07 06:31:00.956+00
264	5	11.24439690	77.50781310	0.16822317391633987	\N	2026-07-07 06:31:01.937+00
265	5	11.24439700	77.50781290	0.12313639372587204	\N	2026-07-07 06:31:03.06+00
266	5	11.24439700	77.50781290	0.13555117249488832	\N	2026-07-07 06:31:03.988+00
267	5	11.24439690	77.50781290	0.15526168048381805	\N	2026-07-07 06:31:04.988+00
268	5	11.24439680	77.50781320	0.1869431957602501	\N	2026-07-07 06:31:05.986+00
269	5	11.24439660	77.50781330	0.1583211824297905	\N	2026-07-07 06:31:06.987+00
270	5	11.24439660	77.50781320	0.159235118329525	\N	2026-07-07 06:31:07.966+00
271	5	11.24439670	77.50781330	0.1783206582069397	\N	2026-07-07 06:31:09.066+00
272	5	11.24439680	77.50781320	0.1507534235715866	\N	2026-07-07 06:31:09.971+00
273	5	11.24439680	77.50781310	0.15730758905410766	\N	2026-07-07 06:31:10.938+00
274	5	11.24439690	77.50781310	0.1329980581998825	\N	2026-07-07 06:31:11.977+00
275	5	11.24439670	77.50781310	0.1623088762164116	\N	2026-07-07 06:31:12.931+00
276	5	11.24439670	77.50781310	0.1430027112364769	\N	2026-07-07 06:31:13.939+00
277	5	11.24439660	77.50781310	0.13503286242485046	\N	2026-07-07 06:31:15.039+00
278	5	11.24439660	77.50781300	0.15002132803201676	\N	2026-07-07 06:31:15.865+00
279	5	11.24439650	77.50781280	0.11698474735021591	\N	2026-07-07 06:31:16.987+00
280	5	11.24439650	77.50781270	0.17415127158164978	\N	2026-07-07 06:31:17.967+00
281	5	11.24439670	77.50781270	0.17462850362062454	\N	2026-07-07 06:31:18.985+00
282	5	11.24439680	77.50781270	0.12529491484165192	\N	2026-07-07 06:31:19.986+00
283	5	11.24439690	77.50781290	0.1336846500635147	\N	2026-07-07 06:31:21.067+00
284	5	11.24439700	77.50781280	0.15349018871784212	\N	2026-07-07 06:31:22.088+00
285	5	11.24439710	77.50781320	0.19094686210155487	\N	2026-07-07 06:31:22.748+00
286	5	11.24439710	77.50781320	0.19182973802089692	\N	2026-07-07 06:31:23.003+00
287	5	11.24439700	77.50781320	0.14405826777219774	\N	2026-07-07 06:31:23.934+00
288	5	11.24439700	77.50781290	0.15383717268705369	\N	2026-07-07 06:31:24.962+00
289	5	11.24439700	77.50781290	0.13405802696943284	\N	2026-07-07 06:31:25.959+00
290	5	11.24439720	77.50781290	0.15881988555192947	\N	2026-07-07 06:31:27.079+00
291	5	11.24439720	77.50781290	0.14468767493963242	\N	2026-07-07 06:31:27.958+00
292	5	11.24439730	77.50781300	0.15565690398216248	\N	2026-07-07 06:31:28.952+00
293	5	11.24439730	77.50781320	0.15915482640266418	\N	2026-07-07 06:31:29.602+00
294	5	11.24439730	77.50781320	0.16157210022211074	\N	2026-07-07 06:31:29.999+00
295	5	11.24439740	77.50781330	0.16481726467609406	\N	2026-07-07 06:31:30.976+00
296	5	11.24439740	77.50781340	0.1654304176568985	\N	2026-07-07 06:31:31.973+00
297	5	11.24439780	77.50781420	0.1342090755701065	\N	2026-07-07 06:31:33.051+00
298	5	11.24439800	77.50781500	0.15086030960083008	\N	2026-07-07 06:31:33.99+00
299	5	11.24439800	77.50781600	0.14683003574609757	\N	2026-07-07 06:31:34.973+00
300	5	11.24439790	77.50781680	0.11884453743696213	\N	2026-07-07 06:31:35.975+00
301	5	11.24439800	77.50781740	0.11871791034936906	\N	2026-07-07 06:31:36.477+00
305	5	11.24439780	77.50782000	0.15013254582881927	\N	2026-07-07 06:31:40.467+00
316	5	11.24439840	77.50782670	0.1522343248128891	\N	2026-07-07 06:31:50.737+00
323	5	11.24439890	77.50782820	0.14785274863243103	\N	2026-07-07 06:31:56.955+00
325	5	11.24439910	77.50782840	0.17489449828863143	\N	2026-07-07 06:31:57.956+00
326	5	11.24439910	77.50782840	0.18036208748817445	\N	2026-07-07 06:31:58.941+00
327	5	11.24439900	77.50782860	0.15315008461475374	\N	2026-07-07 06:31:59.936+00
328	5	11.24439890	77.50782860	0.14701426327228548	\N	2026-07-07 06:32:00.962+00
329	5	11.24439890	77.50782880	0.1719320923089981	\N	2026-07-07 06:32:02.055+00
332	5	11.24439890	77.50782870	0.16487064063549042	\N	2026-07-07 06:32:04.358+00
337	5	11.24439970	77.50782920	0.12187488377094269	\N	2026-07-07 06:32:08.978+00
338	5	11.24439990	77.50782910	0.15653638690710067	\N	2026-07-07 06:32:09.958+00
339	5	11.24439990	77.50782930	0.1749131664633751	\N	2026-07-07 06:32:10.961+00
341	5	11.24439990	77.50782920	0.1452396333217621	\N	2026-07-07 06:32:11.938+00
342	5	11.24439990	77.50782930	0.11035320684313775	\N	2026-07-07 06:32:12.956+00
343	5	11.24439980	77.50782940	0.12662936747074127	\N	2026-07-07 06:32:14.039+00
344	5	11.24439970	77.50782950	0.14493190348148347	\N	2026-07-07 06:32:14.958+00
345	5	11.24439970	77.50782950	0.17493823170661926	\N	2026-07-07 06:32:15.939+00
346	5	11.24439960	77.50782940	0.13209754675626756	\N	2026-07-07 06:32:16.958+00
347	5	11.24439970	77.50782930	0.1740868180990219	\N	2026-07-07 06:32:17.934+00
349	5	11.24439970	77.50782940	0.16727415472269058	\N	2026-07-07 06:32:18.936+00
350	5	11.24439970	77.50782920	0.13996118009090425	\N	2026-07-07 06:32:20.077+00
356	5	11.24439890	77.50782510	0.1819581627845764	\N	2026-07-07 06:32:25.766+00
363	5	11.24439840	77.50781630	0.14974158704280854	\N	2026-07-07 06:32:31.948+00
369	5	11.24439800	77.50781100	0.13493548482656478	\N	2026-07-07 06:32:37.996+00
370	5	11.24439760	77.50781050	0.14395401030778884	\N	2026-07-07 06:32:38.955+00
371	5	11.24439760	77.50781000	0.14082837849855423	\N	2026-07-07 06:32:39.956+00
372	5	11.24439780	77.50780970	0.1412135437130928	\N	2026-07-07 06:32:40.958+00
373	5	11.24439780	77.50780930	0.14263735413551332	\N	2026-07-07 06:32:41.978+00
374	5	11.24439790	77.50780900	0.1502299502491951	\N	2026-07-07 06:32:43.056+00
375	5	11.24439780	77.50780850	0.1405922904610634	\N	2026-07-07 06:32:44.111+00
379	5	11.24439790	77.50780730	0.11939255297183991	\N	2026-07-07 06:32:47.297+00
382	5	11.24439950	77.50780680	0.13669526875019075	\N	2026-07-07 06:32:49.958+00
383	5	11.24440070	77.50780680	0.1407498836517334	\N	2026-07-07 06:32:50.958+00
384	5	11.24440220	77.50780700	0.12824537158012392	\N	2026-07-07 06:32:51.99+00
385	5	11.24440330	77.50780710	0.14760755449533464	\N	2026-07-07 06:32:52.957+00
386	5	11.24440480	77.50780730	0.15721263885498046	\N	2026-07-07 06:32:53.965+00
387	5	11.24440660	77.50780770	0.1444565623998642	\N	2026-07-07 06:32:55.051+00
388	5	11.24440780	77.50780790	0.1515735626220703	\N	2026-07-07 06:32:56.376+00
394	5	11.24441450	77.50780980	0.1387812227010727	\N	2026-07-07 06:33:01.378+00
396	5	11.24441580	77.50781030	0.12318491488695145	\N	2026-07-07 06:33:02.957+00
397	5	11.24441660	77.50781060	0.16042565703392028	\N	2026-07-07 06:33:03.957+00
398	5	11.24441740	77.50781100	0.1809347927570343	\N	2026-07-07 06:33:04.956+00
399	5	11.24441810	77.50781140	0.15808804482221603	\N	2026-07-07 06:33:05.941+00
400	5	11.24441880	77.50781180	0.15727368593215943	\N	2026-07-07 06:33:07.06+00
401	5	11.24441940	77.50781200	0.14315649569034578	\N	2026-07-07 06:33:08.083+00
302	5	11.24439800	77.50781770	0.1213540256023407	\N	2026-07-07 06:31:36.962+00
303	5	11.24439770	77.50781840	0.1056946188211441	\N	2026-07-07 06:31:37.951+00
304	5	11.24439780	77.50781910	0.12048696130514146	\N	2026-07-07 06:31:39.043+00
306	5	11.24439770	77.50782080	0.15038085132837295	\N	2026-07-07 06:31:42.131+00
307	5	11.24439770	77.50782150	0.1335922881960869	\N	2026-07-07 06:31:42.627+00
308	5	11.24439770	77.50782230	0.12836066633462906	\N	2026-07-07 06:31:43.104+00
309	5	11.24439780	77.50782290	0.1312210276722908	\N	2026-07-07 06:31:43.81+00
310	5	11.24439780	77.50782360	0.154749271273613	\N	2026-07-07 06:31:45.086+00
311	5	11.24439800	77.50782420	0.12642581462860109	\N	2026-07-07 06:31:45.964+00
312	5	11.24439830	77.50782480	0.15388688743114473	\N	2026-07-07 06:31:46.984+00
313	5	11.24439840	77.50782530	0.1436889946460724	\N	2026-07-07 06:31:47.985+00
314	5	11.24439850	77.50782570	0.14880601912736893	\N	2026-07-07 06:31:48.987+00
315	5	11.24439850	77.50782610	0.14048807322978973	\N	2026-07-07 06:31:49.984+00
317	5	11.24439840	77.50782680	0.1542133256793022	\N	2026-07-07 06:31:50.986+00
318	5	11.24439840	77.50782720	0.12090409845113755	\N	2026-07-07 06:31:51.966+00
319	5	11.24439840	77.50782740	0.16680514365434648	\N	2026-07-07 06:31:52.986+00
320	5	11.24439850	77.50782760	0.1412889003753662	\N	2026-07-07 06:31:53.983+00
321	5	11.24439880	77.50782790	0.1352449581027031	\N	2026-07-07 06:31:54.985+00
322	5	11.24439890	77.50782810	0.1093629688024521	\N	2026-07-07 06:31:56.08+00
324	5	11.24439900	77.50782830	0.1722882628440857	\N	2026-07-07 06:31:57.543+00
330	5	11.24439880	77.50782880	0.13816522657871247	\N	2026-07-07 06:32:02.986+00
331	5	11.24439880	77.50782870	0.16354499906301498	\N	2026-07-07 06:32:03.963+00
333	5	11.24439890	77.50782880	0.1668969824910164	\N	2026-07-07 06:32:04.965+00
334	5	11.24439920	77.50782890	0.13973042964935303	\N	2026-07-07 06:32:05.985+00
335	5	11.24439930	77.50782900	0.16849490851163865	\N	2026-07-07 06:32:06.997+00
336	5	11.24439940	77.50782920	0.17714956551790237	\N	2026-07-07 06:32:08.087+00
340	5	11.24439990	77.50782930	0.14577300399541857	\N	2026-07-07 06:32:11.645+00
348	5	11.24439970	77.50782930	0.16498533189296724	\N	2026-07-07 06:32:18.505+00
351	5	11.24439970	77.50782910	0.16337660998106004	\N	2026-07-07 06:32:21.014+00
352	5	11.24439960	77.50782910	0.15044758468866348	\N	2026-07-07 06:32:21.99+00
353	5	11.24439930	77.50782840	0.16088977307081223	\N	2026-07-07 06:32:22.985+00
354	5	11.24439920	77.50782750	0.16441131234169007	\N	2026-07-07 06:32:23.992+00
355	5	11.24439900	77.50782640	0.13001155257225036	\N	2026-07-07 06:32:24.986+00
357	5	11.24439890	77.50782470	0.18525348454713822	\N	2026-07-07 06:32:25.983+00
358	5	11.24439890	77.50782360	0.17040460109710695	\N	2026-07-07 06:32:26.985+00
359	5	11.24439870	77.50782230	0.16333994418382644	\N	2026-07-07 06:32:27.983+00
360	5	11.24439850	77.50782060	0.1451206773519516	\N	2026-07-07 06:32:28.982+00
361	5	11.24439840	77.50781920	0.1646374225616455	\N	2026-07-07 06:32:29.987+00
362	5	11.24439840	77.50781770	0.18492609411478042	\N	2026-07-07 06:32:31.084+00
364	5	11.24439830	77.50781540	0.15725154429674149	\N	2026-07-07 06:32:32.89+00
365	5	11.24439820	77.50781420	0.14362325370311738	\N	2026-07-07 06:32:33.985+00
366	5	11.24439820	77.50781300	0.13697345405817032	\N	2026-07-07 06:32:35.004+00
367	5	11.24439800	77.50781210	0.15110897719860078	\N	2026-07-07 06:32:35.986+00
368	5	11.24439810	77.50781150	0.130123333632946	\N	2026-07-07 06:32:37.083+00
376	5	11.24439770	77.50780830	0.14685778319835663	\N	2026-07-07 06:32:44.964+00
377	5	11.24439770	77.50780780	0.13165114670991898	\N	2026-07-07 06:32:45.984+00
378	5	11.24439780	77.50780760	0.14203698188066483	\N	2026-07-07 06:32:46.963+00
380	5	11.24439800	77.50780710	0.12506425827741624	\N	2026-07-07 06:32:47.987+00
381	5	11.24439860	77.50780690	0.11970643848180772	\N	2026-07-07 06:32:49.105+00
389	5	11.24440930	77.50780820	0.14802422225475312	\N	2026-07-07 06:32:56.966+00
390	5	11.24441070	77.50780870	0.1366949334740639	\N	2026-07-07 06:32:57.969+00
391	5	11.24441190	77.50780900	0.1396800309419632	\N	2026-07-07 06:32:58.966+00
392	5	11.24441290	77.50780930	0.15512892454862595	\N	2026-07-07 06:33:00.041+00
393	5	11.24441370	77.50780960	0.1369493544101715	\N	2026-07-07 06:33:01.108+00
395	5	11.24441490	77.50780990	0.14120937287807464	\N	2026-07-07 06:33:02.058+00
402	5	11.24441990	77.50781230	0.16360162049531937	\N	2026-07-07 06:33:08.608+00
403	5	11.24442010	77.50781240	0.16602015495300293	\N	2026-07-07 06:33:09.008+00
404	5	11.24442040	77.50781270	0.16671582609415056	\N	2026-07-07 06:33:09.918+00
405	5	11.24442070	77.50781300	0.11099881455302239	\N	2026-07-07 06:33:10.917+00
406	5	11.24442090	77.50781320	0.1239736720919609	\N	2026-07-07 06:33:11.917+00
407	5	11.24442130	77.50781340	0.1391593873500824	\N	2026-07-07 06:33:13.156+00
408	5	11.24442160	77.50781340	0.1448682948946953	\N	2026-07-07 06:33:13.966+00
409	5	11.24442200	77.50781330	0.17256356477737428	\N	2026-07-07 06:33:14.972+00
410	5	11.24442220	77.50781360	0.13650574386119843	\N	2026-07-07 06:33:15.956+00
411	5	11.24442240	77.50781380	0.11513223946094513	\N	2026-07-07 06:33:16.973+00
412	5	11.24442270	77.50781410	0.13772130757570267	\N	2026-07-07 06:33:17.999+00
413	5	11.24442290	77.50781420	0.14551435858011247	\N	2026-07-07 06:33:19.085+00
414	5	11.24442330	77.50781440	0.16190179735422136	\N	2026-07-07 06:33:19.979+00
415	5	11.24442350	77.50781460	0.1596211552619934	\N	2026-07-07 06:33:20.937+00
416	5	11.24442370	77.50781490	0.16676191985607147	\N	2026-07-07 06:33:22.147+00
417	5	11.24442370	77.50781510	0.14154485017061233	\N	2026-07-07 06:33:22.988+00
418	5	11.24442390	77.50781510	0.14496568590402603	\N	2026-07-07 06:33:23.985+00
419	5	11.24442390	77.50781500	0.1470304772257805	\N	2026-07-07 06:33:25.082+00
420	5	11.24442380	77.50781480	0.14201029390096664	\N	2026-07-07 06:33:25.955+00
421	5	11.24442380	77.50781490	0.13159970194101334	\N	2026-07-07 06:33:26.956+00
422	5	11.24442380	77.50781460	0.1805849924683571	\N	2026-07-07 06:33:27.997+00
423	5	11.24442400	77.50781450	0.15046720504760744	\N	2026-07-07 06:33:28.997+00
424	5	11.24442420	77.50781450	0.14958129823207855	\N	2026-07-07 06:33:29.995+00
425	5	11.24442410	77.50781440	0.1583135649561882	\N	2026-07-07 06:33:30.502+00
426	5	11.24442420	77.50781440	0.160554376244545	\N	2026-07-07 06:33:30.926+00
427	5	11.24442470	77.50781390	0.14383285492658615	\N	2026-07-07 06:33:31.933+00
428	5	11.24442530	77.50781330	0.12728889584541322	\N	2026-07-07 06:33:32.957+00
429	5	11.24442550	77.50781310	0.1334502249956131	\N	2026-07-07 06:33:33.963+00
430	5	11.24442570	77.50781270	0.12535680681467057	\N	2026-07-07 06:33:34.958+00
431	5	11.24442590	77.50781250	0.16370869427919388	\N	2026-07-07 06:33:36.057+00
432	5	11.24442580	77.50781230	0.14779400825500488	\N	2026-07-07 06:33:36.992+00
433	5	11.24442570	77.50781220	0.15925190895795824	\N	2026-07-07 06:33:37.278+00
434	5	11.24442590	77.50781200	0.17615560591220855	\N	2026-07-07 06:33:37.993+00
435	5	11.24442590	77.50781180	0.13774790167808534	\N	2026-07-07 06:33:38.977+00
436	5	11.24442600	77.50781180	0.13197145611047745	\N	2026-07-07 06:33:40.004+00
437	5	11.24442600	77.50781140	0.13025685399770737	\N	2026-07-07 06:33:41.006+00
438	5	11.24442580	77.50781130	0.11830938309431076	\N	2026-07-07 06:33:42.093+00
439	5	11.24442570	77.50781110	0.15812302082777024	\N	2026-07-07 06:33:42.957+00
440	5	11.24442530	77.50781130	0.16661219894886017	\N	2026-07-07 06:33:43.978+00
441	5	11.24442490	77.50781150	0.13500845432281494	\N	2026-07-07 06:33:44.684+00
442	5	11.24442480	77.50781150	0.1367903396487236	\N	2026-07-07 06:33:44.975+00
443	5	11.24442420	77.50781180	0.1339774802327156	\N	2026-07-07 06:33:45.959+00
444	5	11.24442380	77.50781200	0.13765960335731506	\N	2026-07-07 06:33:46.937+00
445	5	11.24442340	77.50781210	0.1530419781804085	\N	2026-07-07 06:33:48.059+00
449	5	11.24442190	77.50781320	0.13794519156217575	\N	2026-07-07 06:33:51.796+00
450	5	11.24442120	77.50781410	0.14535372108221054	\N	2026-07-07 06:33:52.941+00
451	5	11.24442000	77.50781510	0.1267907828092575	\N	2026-07-07 06:33:54.058+00
455	5	11.24441620	77.50781910	0.1237558901309967	\N	2026-07-07 06:33:57.951+00
456	5	11.24441580	77.50782040	0.12531091421842575	\N	2026-07-07 06:33:58.957+00
457	5	11.24441570	77.50782160	0.1380120322108269	\N	2026-07-07 06:34:00.059+00
460	5	11.24441600	77.50782530	0.16503803730010988	\N	2026-07-07 06:34:02.929+00
461	5	11.24441620	77.50782660	0.13716560751199722	\N	2026-07-07 06:34:03.911+00
462	5	11.24441650	77.50782730	0.10438476875424385	\N	2026-07-07 06:34:04.922+00
463	5	11.24441730	77.50782830	0.11083337590098381	\N	2026-07-07 06:34:06.048+00
470	5	11.24442380	77.50783020	0.1327665165066719	\N	2026-07-07 06:34:12.956+00
472	5	11.24442520	77.50782950	0.13189925104379654	\N	2026-07-07 06:34:13.976+00
473	5	11.24442590	77.50782930	0.11739014983177186	\N	2026-07-07 06:34:14.949+00
474	5	11.24442690	77.50782880	0.1575799271464348	\N	2026-07-07 06:34:15.957+00
475	5	11.24442780	77.50782830	0.13448928594589235	\N	2026-07-07 06:34:16.937+00
476	5	11.24442850	77.50782800	0.15551812648773194	\N	2026-07-07 06:34:18.004+00
477	5	11.24442900	77.50782780	0.1362707018852234	\N	2026-07-07 06:34:18.935+00
478	5	11.24442960	77.50782750	0.1448697701096535	\N	2026-07-07 06:34:19.956+00
480	5	11.24443010	77.50782750	0.15303664058446884	\N	2026-07-07 06:34:21.001+00
481	5	11.24443040	77.50782770	0.1386778771877289	\N	2026-07-07 06:34:21.935+00
482	5	11.24443080	77.50782820	0.10988536924123764	\N	2026-07-07 06:34:22.938+00
483	5	11.24443100	77.50782930	0.12015580236911774	\N	2026-07-07 06:34:24.016+00
484	5	11.24443120	77.50783020	0.15234554260969163	\N	2026-07-07 06:34:24.965+00
485	5	11.24443140	77.50783090	0.15138417184352876	\N	2026-07-07 06:34:25.956+00
486	5	11.24443150	77.50783170	0.1263640433549881	\N	2026-07-07 06:34:26.978+00
488	5	11.24443160	77.50783240	0.10952229201793671	\N	2026-07-07 06:34:27.938+00
489	5	11.24443180	77.50783300	0.11950413286685944	\N	2026-07-07 06:34:28.938+00
490	5	11.24443190	77.50783360	0.1370074912905693	\N	2026-07-07 06:34:30.062+00
491	5	11.24443210	77.50783390	0.1398504450917244	\N	2026-07-07 06:34:31.315+00
446	5	11.24442300	77.50781220	0.1332488313317299	\N	2026-07-07 06:33:48.986+00
447	5	11.24442270	77.50781220	0.13342322856187822	\N	2026-07-07 06:33:49.989+00
448	5	11.24442220	77.50781270	0.15909408777952194	\N	2026-07-07 06:33:50.984+00
452	5	11.24441920	77.50781610	0.1302998095750809	\N	2026-07-07 06:33:55+00
453	5	11.24441820	77.50781720	0.1077688381075859	\N	2026-07-07 06:33:55.978+00
454	5	11.24441720	77.50781820	0.15564563870429993	\N	2026-07-07 06:33:57.06+00
458	5	11.24441570	77.50782290	0.12883394211530685	\N	2026-07-07 06:34:00.986+00
459	5	11.24441580	77.50782400	0.16333044916391373	\N	2026-07-07 06:34:02.025+00
464	5	11.24441830	77.50782920	0.12104286253452301	\N	2026-07-07 06:34:06.969+00
465	5	11.24441920	77.50783000	0.11466430127620697	\N	2026-07-07 06:34:07.99+00
466	5	11.24442000	77.50783060	0.12993327230215074	\N	2026-07-07 06:34:08.956+00
467	5	11.24442090	77.50783090	0.12374037355184556	\N	2026-07-07 06:34:09.99+00
468	5	11.24442170	77.50783080	0.1343843311071396	\N	2026-07-07 06:34:11.083+00
469	5	11.24442260	77.50783070	0.12520566433668137	\N	2026-07-07 06:34:12.104+00
471	5	11.24442470	77.50782960	0.12979682832956316	\N	2026-07-07 06:34:13.362+00
479	5	11.24442990	77.50782750	0.15075467079877855	\N	2026-07-07 06:34:20.544+00
487	5	11.24443160	77.50783220	0.10965349897742271	\N	2026-07-07 06:34:27.744+00
492	5	11.24443210	77.50783430	0.12280047386884689	\N	2026-07-07 06:34:32.513+00
493	5	11.24443200	77.50783500	0.1033050388097763	\N	2026-07-07 06:34:32.891+00
494	5	11.24443180	77.50783580	0.1447647750377655	\N	2026-07-07 06:34:33.93+00
495	5	11.24443160	77.50783660	0.15975053161382677	\N	2026-07-07 06:34:34.923+00
496	5	11.24443140	77.50783730	0.15843783169984818	\N	2026-07-07 06:34:36.003+00
497	5	11.24443090	77.50783810	0.21230572164058686	\N	2026-07-07 06:34:36.986+00
498	5	11.24443070	77.50783900	0.22093937695026397	\N	2026-07-07 06:34:37.942+00
499	5	11.24443040	77.50783970	0.22355517446994783	\N	2026-07-07 06:34:38.983+00
500	5	11.24442990	77.50784040	0.24772598147392275	\N	2026-07-07 06:34:39.945+00
501	5	11.24442950	77.50784110	0.09926065653562546	\N	2026-07-07 06:34:40.93+00
502	5	11.24442920	77.50784150	0.12325964123010635	\N	2026-07-07 06:34:42.002+00
503	5	11.24442880	77.50784210	0.13157784193754196	\N	2026-07-07 06:34:42.957+00
504	5	11.24442840	77.50784280	0.1296895667910576	\N	2026-07-07 06:34:43.921+00
505	5	11.24442820	77.50784330	0.12301023602485657	\N	2026-07-07 06:34:44.942+00
506	5	11.24442760	77.50784380	0.16800320595502855	\N	2026-07-07 06:34:45.948+00
507	5	11.24442740	77.50784450	0.1699678435921669	\N	2026-07-07 06:34:46.942+00
508	5	11.24442720	77.50784510	0.1713752254843712	\N	2026-07-07 06:34:48.061+00
509	5	11.24442700	77.50784530	0.13357792496681214	\N	2026-07-07 06:34:49.136+00
510	5	11.24442690	77.50784530	0.11784770786762237	\N	2026-07-07 06:34:49.674+00
511	5	11.24442680	77.50784540	0.1197422593832016	\N	2026-07-07 06:34:50.042+00
512	5	11.24442680	77.50784570	0.12440270483493805	\N	2026-07-07 06:34:50.922+00
513	5	11.24442670	77.50784600	0.14077101945877077	\N	2026-07-07 06:34:51.96+00
514	5	11.24442680	77.50784620	0.1333836391568184	\N	2026-07-07 06:34:52.921+00
515	5	11.24442690	77.50784630	0.14379069060087205	\N	2026-07-07 06:34:54.041+00
516	5	11.24442690	77.50784660	0.13352796882390977	\N	2026-07-07 06:34:54.922+00
517	5	11.24442700	77.50784680	0.16525997668504716	\N	2026-07-07 06:34:55.921+00
518	5	11.24442710	77.50784680	0.13231742084026338	\N	2026-07-07 06:34:56.601+00
519	5	11.24442720	77.50784680	0.13169238567352295	\N	2026-07-07 06:34:56.949+00
520	5	11.24442710	77.50784700	0.11346476376056672	\N	2026-07-07 06:34:57.952+00
521	5	11.24442700	77.50784730	0.12327497005462647	\N	2026-07-07 06:34:58.932+00
522	5	11.24442680	77.50784750	0.11558175086975098	\N	2026-07-07 06:35:00.055+00
523	5	11.24442690	77.50784760	0.11930487155914307	\N	2026-07-07 06:35:00.947+00
524	5	11.24442690	77.50784760	0.1809378907084465	\N	2026-07-07 06:35:01.935+00
525	5	11.24442700	77.50784790	0.1523101106286049	\N	2026-07-07 06:35:02.925+00
526	5	11.24442690	77.50784790	0.14002832919359207	\N	2026-07-07 06:35:03.832+00
527	5	11.24442670	77.50784810	0.13515448719263076	\N	2026-07-07 06:35:04.951+00
528	5	11.24442660	77.50784820	0.14720321148633958	\N	2026-07-07 06:35:06.051+00
529	5	11.24442650	77.50784860	0.143405981361866	\N	2026-07-07 06:35:06.947+00
530	5	11.24442660	77.50784870	0.1546111911535263	\N	2026-07-07 06:35:07.922+00
531	5	11.24442680	77.50784870	0.11055755093693734	\N	2026-07-07 06:35:09.041+00
532	5	11.24442660	77.50784890	0.17008382230997085	\N	2026-07-07 06:35:09.946+00
533	5	11.24442660	77.50784910	0.1496503919363022	\N	2026-07-07 06:35:10.923+00
534	5	11.24442640	77.50784920	0.14535791873931886	\N	2026-07-07 06:35:12.042+00
535	5	11.24442620	77.50784940	0.17157145589590073	\N	2026-07-07 06:35:12.961+00
536	5	11.24442610	77.50784950	0.167741596698761	\N	2026-07-07 06:35:13.944+00
537	5	11.24442550	77.50784720	0.15903290659189226	\N	2026-07-07 06:35:14.923+00
538	5	11.24442440	77.50784400	0.16064775735139847	\N	2026-07-07 06:35:15.962+00
539	5	11.24442340	77.50783980	0.1639292925596237	\N	2026-07-07 06:35:16.946+00
540	5	11.24442290	77.50783660	0.1575700029730797	\N	2026-07-07 06:35:18.425+00
541	5	11.24442280	77.50783510	0.1431324362754822	\N	2026-07-07 06:35:18.839+00
542	5	11.24442260	77.50783420	0.14492110759019852	\N	2026-07-07 06:35:19.174+00
543	5	11.24442240	77.50783300	0.16817591339349747	\N	2026-07-07 06:35:19.942+00
544	5	11.24442220	77.50783180	0.1579681769013405	\N	2026-07-07 06:35:20.953+00
545	5	11.24442220	77.50783070	0.14102415293455126	\N	2026-07-07 06:35:21.942+00
546	5	11.24442220	77.50782940	0.17532625347375871	\N	2026-07-07 06:35:22.953+00
547	5	11.24442220	77.50782800	0.14687048345804216	\N	2026-07-07 06:35:24.043+00
548	5	11.24442200	77.50782650	0.15780193358659744	\N	2026-07-07 06:35:24.93+00
549	5	11.24442190	77.50782530	0.14276249259710314	\N	2026-07-07 06:35:25.479+00
550	5	11.24442180	77.50782490	0.14437734335660934	\N	2026-07-07 06:35:25.95+00
551	5	11.24442160	77.50782380	0.19596928507089614	\N	2026-07-07 06:35:26.951+00
552	5	11.24442140	77.50782260	0.173910690844059	\N	2026-07-07 06:35:27.951+00
553	5	11.24442140	77.50782150	0.1706572249531746	\N	2026-07-07 06:35:28.936+00
554	5	11.24442120	77.50782050	0.12864798456430435	\N	2026-07-07 06:35:30.046+00
555	5	11.24442110	77.50781970	0.17769982069730758	\N	2026-07-07 06:35:30.926+00
556	5	11.24442100	77.50781900	0.19235756993293762	\N	2026-07-07 06:35:31.947+00
557	5	11.24442090	77.50781840	0.17635056227445603	\N	2026-07-07 06:35:33.053+00
558	5	11.24442090	77.50781820	0.1778687596321106	\N	2026-07-07 06:35:33.237+00
559	5	11.24442050	77.50781750	0.18378366082906725	\N	2026-07-07 06:35:34.027+00
560	5	11.24442030	77.50781680	0.13779427707195283	\N	2026-07-07 06:35:35.016+00
561	5	11.24442020	77.50781630	0.134471395611763	\N	2026-07-07 06:35:36.031+00
562	5	11.24442000	77.50781580	0.16222639828920365	\N	2026-07-07 06:35:36.953+00
563	5	11.24441980	77.50781550	0.14120258688926698	\N	2026-07-07 06:35:37.974+00
564	5	11.24441950	77.50781530	0.14495192617177963	\N	2026-07-07 06:35:38.968+00
565	5	11.24441930	77.50781500	0.15384092777967454	\N	2026-07-07 06:35:39.906+00
566	5	11.24441920	77.50781490	0.10802465379238128	\N	2026-07-07 06:35:40.963+00
567	5	11.24441900	77.50781450	0.14543841183185577	\N	2026-07-07 06:35:42.057+00
568	5	11.24441900	77.50781410	0.15468205511569977	\N	2026-07-07 06:35:42.885+00
569	5	11.24441890	77.50781390	0.16421615481376647	\N	2026-07-07 06:35:43.941+00
570	5	11.24441870	77.50781360	0.15772650986909867	\N	2026-07-07 06:35:44.93+00
571	5	11.24441870	77.50781330	0.13907759338617326	\N	2026-07-07 06:35:45.937+00
572	5	11.24441830	77.50781300	0.155610528588295	\N	2026-07-07 06:35:46.982+00
573	5	11.24441810	77.50781280	0.17063449323177338	\N	2026-07-07 06:35:48.053+00
579	5	11.24441790	77.50781190	0.1568266421556473	\N	2026-07-07 06:35:54.311+00
594	5	11.24441710	77.50781120	0.16651141494512559	\N	2026-07-07 06:36:06.903+00
574	5	11.24441810	77.50781250	0.18831216841936113	\N	2026-07-07 06:35:48.954+00
575	5	11.24441780	77.50781220	0.13481793701648712	\N	2026-07-07 06:35:49.956+00
576	5	11.24441770	77.50781220	0.14996796548366548	\N	2026-07-07 06:35:50.95+00
577	5	11.24441770	77.50781210	0.1602009952068329	\N	2026-07-07 06:35:51.955+00
578	5	11.24441780	77.50781190	0.13040601164102555	\N	2026-07-07 06:35:52.96+00
580	5	11.24441810	77.50781180	0.16634412556886674	\N	2026-07-07 06:35:54.339+00
581	5	11.24441810	77.50781160	0.1693461075425148	\N	2026-07-07 06:35:55.038+00
582	5	11.24441820	77.50781170	0.14635661244392395	\N	2026-07-07 06:35:55.97+00
583	5	11.24441800	77.50781170	0.18510553389787673	\N	2026-07-07 06:35:56.953+00
584	5	11.24441790	77.50781190	0.12805907875299455	\N	2026-07-07 06:35:57.951+00
585	5	11.24441780	77.50781190	0.17762394100427628	\N	2026-07-07 06:35:58.933+00
586	5	11.24441760	77.50781170	0.15559715777635574	\N	2026-07-07 06:36:00.035+00
587	5	11.24441760	77.50781170	0.15215806961059572	\N	2026-07-07 06:36:00.955+00
588	5	11.24441750	77.50781170	0.14304916709661483	\N	2026-07-07 06:36:01.511+00
589	5	11.24441740	77.50781160	0.14502511024475098	\N	2026-07-07 06:36:01.952+00
590	5	11.24441730	77.50781150	0.1555838406085968	\N	2026-07-07 06:36:02.955+00
591	5	11.24441720	77.50781160	0.15197077095508577	\N	2026-07-07 06:36:03.95+00
592	5	11.24441730	77.50781150	0.1750995934009552	\N	2026-07-07 06:36:04.955+00
593	5	11.24441730	77.50781120	0.15655856877565386	\N	2026-07-07 06:36:06.049+00
595	5	11.24441700	77.50781110	0.1495996579527855	\N	2026-07-07 06:36:07.99+00
596	5	11.24441700	77.50781100	0.12165771871805191	\N	2026-07-07 06:36:08.752+00
597	5	11.24441710	77.50781090	0.12427694946527482	\N	2026-07-07 06:36:09.936+00
598	5	11.24441690	77.50781090	0.14280008375644684	\N	2026-07-07 06:36:10.929+00
599	5	11.24441700	77.50781070	0.14978076070547106	\N	2026-07-07 06:36:12.069+00
600	5	11.24441680	77.50781070	0.14343438595533373	\N	2026-07-07 06:36:12.951+00
601	5	11.24441660	77.50781080	0.161246332526207	\N	2026-07-07 06:36:13.946+00
602	5	11.24441670	77.50781070	0.1718044459819794	\N	2026-07-07 06:36:14.951+00
603	5	11.24441700	77.50781070	0.13282777816057206	\N	2026-07-07 06:36:15.951+00
604	5	11.24441700	77.50781070	0.1688653215765953	\N	2026-07-07 06:36:16.95+00
605	5	11.24441710	77.50781060	0.12694905996322634	\N	2026-07-07 06:36:18.112+00
606	5	11.24441720	77.50781070	0.17098747193813324	\N	2026-07-07 06:36:18.934+00
607	5	11.24441740	77.50781080	0.1478639468550682	\N	2026-07-07 06:36:19.95+00
608	5	11.24441750	77.50781110	0.15076031684875488	\N	2026-07-07 06:36:20.935+00
609	5	11.24441760	77.50781110	0.1687347248196602	\N	2026-07-07 06:36:21.953+00
610	5	11.24441750	77.50781100	0.14346032291650773	\N	2026-07-07 06:36:22.936+00
611	5	11.24441770	77.50781090	0.1292559340596199	\N	2026-07-07 06:36:24.045+00
612	5	11.24441780	77.50781090	0.14774053841829302	\N	2026-07-07 06:36:24.957+00
613	5	11.24441800	77.50781090	0.13220499604940414	\N	2026-07-07 06:36:25.971+00
614	5	11.24442000	77.50781150	0.15135256201028824	\N	2026-07-07 06:36:26.952+00
615	5	11.24442250	77.50781260	0.16355131566524506	\N	2026-07-07 06:36:27.944+00
616	5	11.24442500	77.50781410	0.13702163994312286	\N	2026-07-07 06:36:28.94+00
617	5	11.24442720	77.50781520	0.15852705538272857	\N	2026-07-07 06:36:30.059+00
618	5	11.24442820	77.50781620	0.10144253969192506	\N	2026-07-07 06:36:30.401+00
619	5	11.24442870	77.50781670	0.1064788430929184	\N	2026-07-07 06:36:30.956+00
620	5	11.24442940	77.50781770	0.11184466928243637	\N	2026-07-07 06:36:31.955+00
621	5	11.24442940	77.50781930	0.13452387303113938	\N	2026-07-07 06:36:32.951+00
622	5	11.24442920	77.50782110	0.12567275762557983	\N	2026-07-07 06:36:33.952+00
623	5	11.24442870	77.50782310	0.17483557015657425	\N	2026-07-07 06:36:34.933+00
624	5	11.24442840	77.50782400	0.18853137195110323	\N	2026-07-07 06:36:36.056+00
625	5	11.24442800	77.50782480	0.1632756918668747	\N	2026-07-07 06:36:36.985+00
626	5	11.24442800	77.50782540	0.1662676826119423	\N	2026-07-07 06:36:37.595+00
627	5	11.24442800	77.50782550	0.1684998705983162	\N	2026-07-07 06:36:37.969+00
628	5	11.24442800	77.50782610	0.16659335643053055	\N	2026-07-07 06:36:38.97+00
629	5	11.24442810	77.50782650	0.1386357933282852	\N	2026-07-07 06:36:39.95+00
630	5	11.24442810	77.50782690	0.13197572082281114	\N	2026-07-07 06:36:40.995+00
631	5	11.24442830	77.50782710	0.16076877862215042	\N	2026-07-07 06:36:42.081+00
632	5	11.24442840	77.50782740	0.13718025237321854	\N	2026-07-07 06:36:42.954+00
633	5	11.24442860	77.50782790	0.15248851776123049	\N	2026-07-07 06:36:43.952+00
634	5	11.24442870	77.50782830	0.11855468451976776	\N	2026-07-07 06:36:44.81+00
635	5	11.24442880	77.50782840	0.12298704832792283	\N	2026-07-07 06:36:45.958+00
636	5	11.24442890	77.50782830	0.15243339836597444	\N	2026-07-07 06:36:46.951+00
637	5	11.24442900	77.50782860	0.1315208986401558	\N	2026-07-07 06:36:48.048+00
638	5	11.24442930	77.50782880	0.14625448733568192	\N	2026-07-07 06:36:48.932+00
639	5	11.24442950	77.50782880	0.12990946769714357	\N	2026-07-07 06:36:49.94+00
640	5	11.24442980	77.50782910	0.14700833559036255	\N	2026-07-07 06:36:50.922+00
641	5	11.24443000	77.50782910	0.10297709852457047	\N	2026-07-07 06:36:51.961+00
642	5	11.24443020	77.50782860	0.14398202598094942	\N	2026-07-07 06:36:52.95+00
643	5	11.24443090	77.50782800	0.13436582386493684	\N	2026-07-07 06:36:54.053+00
644	5	11.24443160	77.50782720	0.11006944254040718	\N	2026-07-07 06:36:54.952+00
645	5	11.24443220	77.50782620	0.11595566421747208	\N	2026-07-07 06:36:55.955+00
646	5	11.24443260	77.50782520	0.15512381494045258	\N	2026-07-07 06:36:56.965+00
647	5	11.24443330	77.50782410	0.11485012471675873	\N	2026-07-07 06:36:57.973+00
648	5	11.24443440	77.50782280	0.18687485307455062	\N	2026-07-07 06:36:58.952+00
649	5	11.24443590	77.50782160	0.1815727561712265	\N	2026-07-07 06:37:00.011+00
650	5	11.24443700	77.50782100	0.14391058534383774	\N	2026-07-07 06:37:01.043+00
651	5	11.24443780	77.50782030	0.1127885788679123	\N	2026-07-07 06:37:02.671+00
652	5	11.24443850	77.50781960	0.16916599720716477	\N	2026-07-07 06:37:03.145+00
653	5	11.24443920	77.50781880	0.12633173614740373	\N	2026-07-07 06:37:04.015+00
654	5	11.24443980	77.50781810	0.13754912316799164	\N	2026-07-07 06:37:04.921+00
655	5	11.24444030	77.50781740	0.12459454983472824	\N	2026-07-07 06:37:06.069+00
656	5	11.24444060	77.50781680	0.16912858039140702	\N	2026-07-07 06:37:06.974+00
657	5	11.24444100	77.50781610	0.09563455134630204	\N	2026-07-07 06:37:07.973+00
658	5	11.24444150	77.50781550	0.16115067154169083	\N	2026-07-07 06:37:08.955+00
659	5	11.24444190	77.50781480	0.11907001733779908	\N	2026-07-07 06:37:09.954+00
660	5	11.24444220	77.50781430	0.16076267659664153	\N	2026-07-07 06:37:10.957+00
661	5	11.24444260	77.50781380	0.16914125382900239	\N	2026-07-07 06:37:12.076+00
662	5	11.24444300	77.50781360	0.13167757987976075	\N	2026-07-07 06:37:12.951+00
663	5	11.24444330	77.50781330	0.13623001277446747	\N	2026-07-07 06:37:13.95+00
664	5	11.24444380	77.50781270	0.12864004522562028	\N	2026-07-07 06:37:14.981+00
665	5	11.24444430	77.50781220	0.13385325372219087	\N	2026-07-07 06:37:15.983+00
666	5	11.24444450	77.50781200	0.1437474936246872	\N	2026-07-07 06:37:16.971+00
667	5	11.24444490	77.50781180	0.1341788873076439	\N	2026-07-07 06:37:18.07+00
668	5	11.24444540	77.50781120	0.15275551825761796	\N	2026-07-07 06:37:18.955+00
669	5	11.24444550	77.50781080	0.10499421358108521	\N	2026-07-07 06:37:19.933+00
670	5	11.24444560	77.50781040	0.15345773398876192	\N	2026-07-07 06:37:20.959+00
671	5	11.24444560	77.50781010	0.12970533818006516	\N	2026-07-07 06:37:21.959+00
672	5	11.24444570	77.50780990	0.14512754380702972	\N	2026-07-07 06:37:22.954+00
673	5	11.24444600	77.50780970	0.1434583380818367	\N	2026-07-07 06:37:24.065+00
677	5	11.24444650	77.50780930	0.14031091332435608	\N	2026-07-07 06:37:27.398+00
681	5	11.24444330	77.50780740	0.15070775896310806	\N	2026-07-07 06:37:30.936+00
682	5	11.24444100	77.50780620	0.14935864806175234	\N	2026-07-07 06:37:31.953+00
683	5	11.24443880	77.50780520	0.1446104809641838	\N	2026-07-07 06:37:32.959+00
684	5	11.24443670	77.50780440	0.17779153883457186	\N	2026-07-07 06:37:33.958+00
686	5	11.24443450	77.50780360	0.1412747785449028	\N	2026-07-07 06:37:34.955+00
687	5	11.24443320	77.50780300	0.15054230690002443	\N	2026-07-07 06:37:36.039+00
688	5	11.24443170	77.50780230	0.15604943186044692	\N	2026-07-07 06:37:36.973+00
689	5	11.24443020	77.50780170	0.13995843082666398	\N	2026-07-07 06:37:37.955+00
690	5	11.24442900	77.50780110	0.15033165961503983	\N	2026-07-07 06:37:38.951+00
691	5	11.24442750	77.50780060	0.18386412709951402	\N	2026-07-07 06:37:39.954+00
692	5	11.24442650	77.50780000	0.14802337735891344	\N	2026-07-07 06:37:40.921+00
674	5	11.24444610	77.50780970	0.17869858145713807	\N	2026-07-07 06:37:24.974+00
675	5	11.24444630	77.50780950	0.14938447773456573	\N	2026-07-07 06:37:25.973+00
676	5	11.24444640	77.50780940	0.17518605440855026	\N	2026-07-07 06:37:26.931+00
678	5	11.24444660	77.50780930	0.14195787012577057	\N	2026-07-07 06:37:27.977+00
679	5	11.24444660	77.50780910	0.12346255034208298	\N	2026-07-07 06:37:28.955+00
680	5	11.24444510	77.50780850	0.1355540156364441	\N	2026-07-07 06:37:30.07+00
685	5	11.24443500	77.50780380	0.1399463877081871	\N	2026-07-07 06:37:34.589+00
693	5	11.24442540	77.50779960	0.1627928137779236	\N	2026-07-07 06:37:42.03+00
694	5	11.24442450	77.50779920	0.18421392738819123	\N	2026-07-07 06:37:42.974+00
695	5	11.24442380	77.50779870	0.14183345586061477	\N	2026-07-07 06:37:43.971+00
696	5	11.24442300	77.50779840	0.17056090682744982	\N	2026-07-07 06:37:44.954+00
697	5	11.24442220	77.50779800	0.16139637529850007	\N	2026-07-07 06:37:45.951+00
698	5	11.24442150	77.50779760	0.13664693534374237	\N	2026-07-07 06:37:46.973+00
699	5	11.24442090	77.50779730	0.15047208666801454	\N	2026-07-07 06:37:48.052+00
700	5	11.24442050	77.50779700	0.17269999533891678	\N	2026-07-07 06:37:48.959+00
701	5	11.24442010	77.50779660	0.14556395262479782	\N	2026-07-07 06:37:49.939+00
702	5	11.24441980	77.50779640	0.14142335951328278	\N	2026-07-07 06:37:50.95+00
703	5	11.24441960	77.50779610	0.15198407471179962	\N	2026-07-07 06:37:51.98+00
704	5	11.24441940	77.50779590	0.15911684632301332	\N	2026-07-07 06:37:52.968+00
705	5	11.24441930	77.50779580	0.12438557893037797	\N	2026-07-07 06:37:54.062+00
706	5	11.24441930	77.50779550	0.15565812438726426	\N	2026-07-07 06:37:54.97+00
707	5	11.24441920	77.50779510	0.14296509325504303	\N	2026-07-07 06:37:55.933+00
708	5	11.24441920	77.50779510	0.13895828872919083	\N	2026-07-07 06:37:56.142+00
709	5	11.24441910	77.50779510	0.14390279352664948	\N	2026-07-07 06:37:56.956+00
710	5	11.24441910	77.50779490	0.145563805103302	\N	2026-07-07 06:37:57.913+00
711	5	11.24441900	77.50779470	0.15566951036453247	\N	2026-07-07 06:37:58.912+00
712	5	11.24441920	77.50779440	0.13620079010725022	\N	2026-07-07 06:38:00.072+00
713	5	11.24441930	77.50779400	0.1665433332324028	\N	2026-07-07 06:38:00.959+00
714	5	11.24441960	77.50779370	0.1317364141345024	\N	2026-07-07 06:38:01.963+00
715	5	11.24442020	77.50779330	0.18936226665973663	\N	2026-07-07 06:38:02.976+00
716	5	11.24442100	77.50779300	0.15580411702394487	\N	2026-07-07 06:38:03.393+00
717	5	11.24442130	77.50779280	0.15661529749631883	\N	2026-07-07 06:38:03.958+00
718	5	11.24442210	77.50779240	0.15172579139471054	\N	2026-07-07 06:38:04.992+00
719	5	11.24442300	77.50779190	0.17594945132732392	\N	2026-07-07 06:38:06.043+00
720	5	11.24442400	77.50779150	0.16514755189418792	\N	2026-07-07 06:38:06.952+00
721	5	11.24442500	77.50779120	0.1344103753566742	\N	2026-07-07 06:38:07.971+00
722	5	11.24442580	77.50779090	0.14082699716091157	\N	2026-07-07 06:38:09+00
723	5	11.24442660	77.50779040	0.14414792060852052	\N	2026-07-07 06:38:09.949+00
724	5	11.24442700	77.50779030	0.15136414915323257	\N	2026-07-07 06:38:10.741+00
725	5	11.24442830	77.50778970	0.15829662680625917	\N	2026-07-07 06:38:12.062+00
726	5	11.24442940	77.50778960	0.17183272987604142	\N	2026-07-07 06:38:12.973+00
727	5	11.24443030	77.50778940	0.17296321392059327	\N	2026-07-07 06:38:13.973+00
728	5	11.24443090	77.50778940	0.1342465326189995	\N	2026-07-07 06:38:14.97+00
729	5	11.24443110	77.50778950	0.1414417192339897	\N	2026-07-07 06:38:15.959+00
730	5	11.24443130	77.50778960	0.14039665013551714	\N	2026-07-07 06:38:16.97+00
731	5	11.24443120	77.50778950	0.15033925026655198	\N	2026-07-07 06:38:18.079+00
732	5	11.24443110	77.50778950	0.14931331872940065	\N	2026-07-07 06:38:18.961+00
733	5	11.24443090	77.50778960	0.12951026111841202	\N	2026-07-07 06:38:19.96+00
734	5	11.24443030	77.50778960	0.13054438680410385	\N	2026-07-07 06:38:20.938+00
735	5	11.24442960	77.50778940	0.15164647847414017	\N	2026-07-07 06:38:21.939+00
736	5	11.24442860	77.50778890	0.14787737131118775	\N	2026-07-07 06:38:22.959+00
737	5	11.24442770	77.50778840	0.156448732316494	\N	2026-07-07 06:38:24.033+00
738	5	11.24442650	77.50778820	0.15502969622612	\N	2026-07-07 06:38:24.962+00
739	5	11.24442550	77.50778800	0.13174474239349365	\N	2026-07-07 06:38:25.962+00
740	5	11.24442470	77.50778790	0.14794415831565857	\N	2026-07-07 06:38:26.963+00
741	5	11.24442400	77.50778770	0.1370040848851204	\N	2026-07-07 06:38:27.964+00
742	5	11.24442320	77.50778730	0.18782340288162233	\N	2026-07-07 06:38:28.96+00
743	5	11.24442240	77.50778700	0.17265258729457855	\N	2026-07-07 06:38:30.061+00
744	5	11.24442200	77.50778680	0.1556597337126732	\N	2026-07-07 06:38:30.982+00
745	5	11.24442140	77.50778670	0.1729772686958313	\N	2026-07-07 06:38:32.048+00
746	5	11.24442090	77.50778660	0.1473037675023079	\N	2026-07-07 06:38:32.512+00
747	5	11.24442050	77.50778650	0.14963526427745819	\N	2026-07-07 06:38:32.963+00
748	5	11.24442010	77.50778640	0.15904735028743744	\N	2026-07-07 06:38:33.953+00
749	5	11.24441970	77.50778630	0.16143461018800737	\N	2026-07-07 06:38:34.934+00
750	5	11.24441940	77.50778600	0.14003695249557496	\N	2026-07-07 06:38:36.032+00
751	5	11.24441900	77.50778600	0.1619407966732979	\N	2026-07-07 06:38:36.95+00
752	5	11.24441880	77.50778600	0.1396128013730049	\N	2026-07-07 06:38:37.955+00
753	5	11.24441850	77.50778610	0.14943710267543794	\N	2026-07-07 06:38:38.959+00
754	5	11.24441830	77.50778600	0.13847170919179916	\N	2026-07-07 06:38:39.6+00
755	5	11.24441820	77.50778590	0.140709288418293	\N	2026-07-07 06:38:39.952+00
756	5	11.24441780	77.50778590	0.1555902510881424	\N	2026-07-07 06:38:40.953+00
757	5	11.24441750	77.50778580	0.17575469613075256	\N	2026-07-07 06:38:42.073+00
758	5	11.24441730	77.50778580	0.12754347771406174	\N	2026-07-07 06:38:42.959+00
759	5	11.24441710	77.50778590	0.16628498286008836	\N	2026-07-07 06:38:43.962+00
760	5	11.24441680	77.50778590	0.1813610762357712	\N	2026-07-07 06:38:44.94+00
761	5	11.24441650	77.50778580	0.15623533576726914	\N	2026-07-07 06:38:45.96+00
762	5	11.24441630	77.50778580	0.1755569502711296	\N	2026-07-07 06:38:46.476+00
763	5	11.24441620	77.50778570	0.17614557445049286	\N	2026-07-07 06:38:46.964+00
764	5	11.24441610	77.50778570	0.15076427310705184	\N	2026-07-07 06:38:48.08+00
765	5	11.24441600	77.50778560	0.15107343792915345	\N	2026-07-07 06:38:48.936+00
766	5	11.24441570	77.50778550	0.14934357404708862	\N	2026-07-07 06:38:49.977+00
767	5	11.24441560	77.50778530	0.11855350434780121	\N	2026-07-07 06:38:50.954+00
768	5	11.24441560	77.50778490	0.16764553338289262	\N	2026-07-07 06:38:51.974+00
769	5	11.24441560	77.50778490	0.1534305229783058	\N	2026-07-07 06:38:52.954+00
770	5	11.24441550	77.50778510	0.13767777532339096	\N	2026-07-07 06:38:53.461+00
771	5	11.24441530	77.50778510	0.1396592438220978	\N	2026-07-07 06:38:53.956+00
772	5	11.24441540	77.50778530	0.13053668886423112	\N	2026-07-07 06:38:54.953+00
773	5	11.24441520	77.50778550	0.13840634375810623	\N	2026-07-07 06:38:55.974+00
774	5	11.24441530	77.50778560	0.1084290437400341	\N	2026-07-07 06:38:56.953+00
775	5	11.24441530	77.50778580	0.12891593724489211	\N	2026-07-07 06:38:57.953+00
776	5	11.24441530	77.50778590	0.14716981798410417	\N	2026-07-07 06:38:59.067+00
777	5	11.24441520	77.50778610	0.1774371787905693	\N	2026-07-07 06:38:59.962+00
778	5	11.24441520	77.50778610	0.12745330184698106	\N	2026-07-07 06:39:00.53+00
779	5	11.24441520	77.50778610	0.128999662399292	\N	2026-07-07 06:39:00.966+00
780	5	11.24441520	77.50778650	0.13561659157276154	\N	2026-07-07 06:39:01.958+00
781	5	11.24441520	77.50778670	0.13125305324792863	\N	2026-07-07 06:39:02.96+00
782	5	11.24441520	77.50778690	0.139181287586689	\N	2026-07-07 06:39:03.943+00
783	5	11.24441530	77.50778690	0.158317668735981	\N	2026-07-07 06:39:05.042+00
786	5	11.24441550	77.50778710	0.1720286786556244	\N	2026-07-07 06:39:07.761+00
797	5	11.24441620	77.50778650	0.1675841376185417	\N	2026-07-07 06:39:17.961+00
798	5	11.24441620	77.50778630	0.1401316076517105	\N	2026-07-07 06:39:18.959+00
799	5	11.24441640	77.50778630	0.1624235138297081	\N	2026-07-07 06:39:19.961+00
800	5	11.24441650	77.50778620	0.1459939643740654	\N	2026-07-07 06:39:20.96+00
801	5	11.24441660	77.50778610	0.14130736738443375	\N	2026-07-07 06:39:21.945+00
803	5	11.24441670	77.50778580	0.09966372549533845	\N	2026-07-07 06:39:22.959+00
804	5	11.24441660	77.50778570	0.12948498129844666	\N	2026-07-07 06:39:23.943+00
805	5	11.24441650	77.50778580	0.16258529126644136	\N	2026-07-07 06:39:24.963+00
806	5	11.24441640	77.50778580	0.12101233899593354	\N	2026-07-07 06:39:25.965+00
807	5	11.24441630	77.50778600	0.1311205118894577	\N	2026-07-07 06:39:26.962+00
808	5	11.24441630	77.50778580	0.1515381172299385	\N	2026-07-07 06:39:28.066+00
784	5	11.24441530	77.50778700	0.13467907905578613	\N	2026-07-07 06:39:05.953+00
785	5	11.24441540	77.50778710	0.1270440772175789	\N	2026-07-07 06:39:06.95+00
787	5	11.24441560	77.50778710	0.17285744100809097	\N	2026-07-07 06:39:07.954+00
788	5	11.24441560	77.50778700	0.13577688038349153	\N	2026-07-07 06:39:08.956+00
789	5	11.24441580	77.50778700	0.17190022766590118	\N	2026-07-07 06:39:09.972+00
790	5	11.24441580	77.50778690	0.15271760523319244	\N	2026-07-07 06:39:11.033+00
791	5	11.24441600	77.50778680	0.14337164908647537	\N	2026-07-07 06:39:11.955+00
792	5	11.24441620	77.50778670	0.1462268337607384	\N	2026-07-07 06:39:12.952+00
793	5	11.24441620	77.50778670	0.1599553853273392	\N	2026-07-07 06:39:13.933+00
794	5	11.24441600	77.50778670	0.13553414046764375	\N	2026-07-07 06:39:14.951+00
795	5	11.24441600	77.50778650	0.13167642652988434	\N	2026-07-07 06:39:15.953+00
796	5	11.24441610	77.50778650	0.14392501562833787	\N	2026-07-07 06:39:17.052+00
802	5	11.24441660	77.50778590	0.09538908898830414	\N	2026-07-07 06:39:22.313+00
809	8	11.24401975	77.50679439	\N	\N	2026-07-07 17:00:03.907+00
810	8	11.24470307	77.50692924	\N	\N	2026-07-07 17:00:17.118+00
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trips (id, school_id, driver_id, vehicle_id, trip_type, status, started_at, ended_at, created_at, updated_at) FROM stdin;
1	1	1	1	drop	completed	2026-07-04 05:23:02.193+00	2026-07-04 05:26:05.155+00	2026-07-04 05:23:02.193+00	2026-07-04 05:26:05.155+00
2	1	1	1	pickup	completed	2026-07-05 14:45:03.889+00	2026-07-05 14:45:50.488+00	2026-07-05 14:45:03.89+00	2026-07-05 14:45:50.488+00
3	1	2	2	pickup	completed	2026-07-07 04:59:34.335+00	2026-07-07 04:59:49.669+00	2026-07-07 04:59:34.335+00	2026-07-07 04:59:49.669+00
4	1	2	2	drop	completed	2026-07-07 04:59:58.141+00	2026-07-07 05:26:52.676+00	2026-07-07 04:59:58.141+00	2026-07-07 05:26:52.676+00
6	1	1	1	pickup	completed	2026-07-07 06:21:13.918+00	2026-07-07 06:21:56.486+00	2026-07-07 06:21:13.918+00	2026-07-07 06:21:56.487+00
7	1	1	1	drop	completed	2026-07-07 06:22:03.011+00	2026-07-07 06:22:11.206+00	2026-07-07 06:22:03.011+00	2026-07-07 06:22:11.206+00
5	1	2	2	pickup	completed	2026-07-07 05:27:11.33+00	2026-07-07 06:39:28.697+00	2026-07-07 05:27:11.33+00	2026-07-07 06:39:28.697+00
8	1	2	2	pickup	completed	2026-07-07 14:17:10.159+00	2026-07-07 17:00:22.238+00	2026-07-07 14:17:10.16+00	2026-07-07 17:00:22.238+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, school_id, role, email, phone, password, first_login, username, name, is_active, refresh_token, avatar_url, last_login, created_at, updated_at) FROM stdin;
1	\N	super_admin	\N	\N	admin123	f	superadmin	Super Admin	t	\N	\N	\N	2026-07-04 03:32:48.438+00	2026-07-04 03:32:48.438+00
2	1	school_admin	\N	\N	school123	t	school	School Admin	t	\N	\N	\N	2026-07-04 03:34:35.153+00	2026-07-04 03:34:35.153+00
4	1	teacher	\N	\N	T00002@123	t	T00002	Teacher 2	t	\N	\N	\N	2026-07-04 05:04:09.65+00	2026-07-04 05:04:09.65+00
5	1	teacher	\N	\N	T00003@123	t	T00003	Teacher 3	t	\N	\N	\N	2026-07-04 05:04:10.015+00	2026-07-04 05:04:10.015+00
6	1	teacher	\N	\N	T00004@123	t	T00004	Teacher 4	t	\N	\N	\N	2026-07-04 05:04:10.38+00	2026-07-04 05:04:10.38+00
7	1	teacher	\N	\N	T00005@123	t	T00005	Teacher 5	t	\N	\N	\N	2026-07-04 05:04:10.744+00	2026-07-04 05:04:10.744+00
8	1	teacher	\N	\N	T00006@123	t	T00006	Teacher 6	t	\N	\N	\N	2026-07-04 05:04:11.108+00	2026-07-04 05:04:11.108+00
9	1	teacher	\N	\N	T00007@123	t	T00007	Teacher 7	t	\N	\N	\N	2026-07-04 05:04:11.472+00	2026-07-04 05:04:11.472+00
10	1	teacher	\N	\N	T00008@123	t	T00008	Teacher 8	t	\N	\N	\N	2026-07-04 05:04:11.837+00	2026-07-04 05:04:11.837+00
11	1	teacher	\N	\N	T00009@123	t	T00009	Teacher 9	t	\N	\N	\N	2026-07-04 05:04:12.201+00	2026-07-04 05:04:12.201+00
12	1	teacher	\N	\N	T00010@123	t	T00010	Teacher 10	t	\N	\N	\N	2026-07-04 05:04:12.565+00	2026-07-04 05:04:12.565+00
14	1	student	\N	\N	S00002@123	t	S00002	Student 6A-2	t	\N	\N	\N	2026-07-04 05:04:14.579+00	2026-07-04 05:04:14.579+00
15	1	student	\N	\N	S00003@123	t	S00003	Student 6A-3	t	\N	\N	\N	2026-07-04 05:04:14.943+00	2026-07-04 05:04:14.943+00
16	1	student	\N	\N	S00004@123	t	S00004	Student 6A-4	t	\N	\N	\N	2026-07-04 05:04:15.308+00	2026-07-04 05:04:15.308+00
17	1	student	\N	\N	S00005@123	t	S00005	Student 6A-5	t	\N	\N	\N	2026-07-04 05:04:15.672+00	2026-07-04 05:04:15.672+00
18	1	student	\N	\N	S00006@123	t	S00006	Student 6A-6	t	\N	\N	\N	2026-07-04 05:04:16.036+00	2026-07-04 05:04:16.036+00
19	1	student	\N	\N	S00007@123	t	S00007	Student 6A-7	t	\N	\N	\N	2026-07-04 05:04:16.401+00	2026-07-04 05:04:16.401+00
20	1	student	\N	\N	S00008@123	t	S00008	Student 6A-8	t	\N	\N	\N	2026-07-04 05:04:16.765+00	2026-07-04 05:04:16.765+00
21	1	student	\N	\N	S00009@123	t	S00009	Student 6A-9	t	\N	\N	\N	2026-07-04 05:04:17.129+00	2026-07-04 05:04:17.129+00
22	1	student	\N	\N	S00010@123	t	S00010	Student 6A-10	t	\N	\N	\N	2026-07-04 05:04:17.494+00	2026-07-04 05:04:17.494+00
23	1	student	\N	\N	S00021@123	t	S00021	Student 6B-1	t	\N	\N	\N	2026-07-04 05:04:18.585+00	2026-07-04 05:04:18.585+00
24	1	student	\N	\N	S00022@123	t	S00022	Student 6B-2	t	\N	\N	\N	2026-07-04 05:04:18.949+00	2026-07-04 05:04:18.949+00
25	1	student	\N	\N	S00023@123	t	S00023	Student 6B-3	t	\N	\N	\N	2026-07-04 05:04:19.313+00	2026-07-04 05:04:19.313+00
26	1	student	\N	\N	S00024@123	t	S00024	Student 6B-4	t	\N	\N	\N	2026-07-04 05:04:19.677+00	2026-07-04 05:04:19.677+00
27	1	student	\N	\N	S00025@123	t	S00025	Student 6B-5	t	\N	\N	\N	2026-07-04 05:04:20.041+00	2026-07-04 05:04:20.041+00
28	1	student	\N	\N	S00026@123	t	S00026	Student 6B-6	t	\N	\N	\N	2026-07-04 05:04:20.405+00	2026-07-04 05:04:20.405+00
29	1	student	\N	\N	S00027@123	t	S00027	Student 6B-7	t	\N	\N	\N	2026-07-04 05:04:20.769+00	2026-07-04 05:04:20.769+00
30	1	student	\N	\N	S00028@123	t	S00028	Student 6B-8	t	\N	\N	\N	2026-07-04 05:04:21.133+00	2026-07-04 05:04:21.133+00
31	1	student	\N	\N	S00029@123	t	S00029	Student 6B-9	t	\N	\N	\N	2026-07-04 05:04:21.498+00	2026-07-04 05:04:21.498+00
32	1	student	\N	\N	S00030@123	t	S00030	Student 6B-10	t	\N	\N	\N	2026-07-04 05:04:21.862+00	2026-07-04 05:04:21.862+00
33	1	student	\N	\N	S00041@123	t	S00041	Student 7A-1	t	\N	\N	\N	2026-07-04 05:04:23.499+00	2026-07-04 05:04:23.499+00
34	1	student	\N	\N	S00042@123	t	S00042	Student 7A-2	t	\N	\N	\N	2026-07-04 05:04:23.863+00	2026-07-04 05:04:23.863+00
35	1	student	\N	\N	S00043@123	t	S00043	Student 7A-3	t	\N	\N	\N	2026-07-04 05:04:24.227+00	2026-07-04 05:04:24.227+00
36	1	student	\N	\N	S00044@123	t	S00044	Student 7A-4	t	\N	\N	\N	2026-07-04 05:04:24.591+00	2026-07-04 05:04:24.591+00
37	1	student	\N	\N	S00045@123	t	S00045	Student 7A-5	t	\N	\N	\N	2026-07-04 05:04:24.955+00	2026-07-04 05:04:24.955+00
38	1	student	\N	\N	S00046@123	t	S00046	Student 7A-6	t	\N	\N	\N	2026-07-04 05:04:25.319+00	2026-07-04 05:04:25.319+00
39	1	student	\N	\N	S00047@123	t	S00047	Student 7A-7	t	\N	\N	\N	2026-07-04 05:04:25.683+00	2026-07-04 05:04:25.683+00
40	1	student	\N	\N	S00048@123	t	S00048	Student 7A-8	t	\N	\N	\N	2026-07-04 05:04:26.047+00	2026-07-04 05:04:26.047+00
41	1	student	\N	\N	S00049@123	t	S00049	Student 7A-9	t	\N	\N	\N	2026-07-04 05:04:26.41+00	2026-07-04 05:04:26.41+00
42	1	student	\N	\N	S00050@123	t	S00050	Student 7A-10	t	\N	\N	\N	2026-07-04 05:04:26.774+00	2026-07-04 05:04:26.774+00
43	1	student	\N	\N	S00061@123	t	S00061	Student 7B-1	t	\N	\N	\N	2026-07-04 05:04:27.865+00	2026-07-04 05:04:27.865+00
44	1	student	\N	\N	S00062@123	t	S00062	Student 7B-2	t	\N	\N	\N	2026-07-04 05:04:28.23+00	2026-07-04 05:04:28.23+00
45	1	student	\N	\N	S00063@123	t	S00063	Student 7B-3	t	\N	\N	\N	2026-07-04 05:04:28.594+00	2026-07-04 05:04:28.594+00
46	1	student	\N	\N	S00064@123	t	S00064	Student 7B-4	t	\N	\N	\N	2026-07-04 05:04:28.958+00	2026-07-04 05:04:28.958+00
47	1	student	\N	\N	S00065@123	t	S00065	Student 7B-5	t	\N	\N	\N	2026-07-04 05:04:29.322+00	2026-07-04 05:04:29.322+00
48	1	student	\N	\N	S00066@123	t	S00066	Student 7B-6	t	\N	\N	\N	2026-07-04 05:04:29.686+00	2026-07-04 05:04:29.686+00
49	1	student	\N	\N	S00067@123	t	S00067	Student 7B-7	t	\N	\N	\N	2026-07-04 05:04:30.05+00	2026-07-04 05:04:30.05+00
50	1	student	\N	\N	S00068@123	t	S00068	Student 7B-8	t	\N	\N	\N	2026-07-04 05:04:30.413+00	2026-07-04 05:04:30.413+00
51	1	student	\N	\N	S00069@123	t	S00069	Student 7B-9	t	\N	\N	\N	2026-07-04 05:04:30.777+00	2026-07-04 05:04:30.777+00
52	1	student	\N	\N	S00070@123	t	S00070	Student 7B-10	t	\N	\N	\N	2026-07-04 05:04:31.141+00	2026-07-04 05:04:31.141+00
3	1	teacher	teacher@gmail.com	8680947556	T00001@123	f	T00001	Sanjay	t	\N	data:image/jpeg;base64,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	\N	2026-07-04 05:04:09.282+00	2026-07-04 05:08:13.718+00
13	1	student	studnt@gmail.com	8680947557	S00001@123	f	S00001	Priya	t	\N	data:image/jpeg;base64,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	\N	2026-07-04 05:04:14.212+00	2026-07-04 05:12:09.637+00
66	1	driver	\N	7686756343	driver1234	f	driver1	Ramesh	t	\N	\N	\N	2026-07-07 04:55:31.772+00	2026-07-07 04:55:31.772+00
53	1	driver	\N	9234567890	driver123	f	driver	Murugan	t	\N	\N	\N	2026-07-04 05:13:36.109+00	2026-07-07 04:57:09.057+00
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicles (id, school_id, vehicle_number, vehicle_name, capacity, driver_id, is_active, created_at, updated_at) FROM stdin;
1	1	TN12345	BUS 1	50	1	t	2026-07-04 05:13:55.982+00	2026-07-04 05:13:55.982+00
2	1	TN654321	BUS 2	40	2	t	2026-07-07 04:58:45.585+00	2026-07-07 04:58:45.585+00
\.


--
-- Data for Name: voice_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voice_logs (id, user_id, purpose, text, tokens_used, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_logs (id, school_id, status, phone, message, response, error, created_at, updated_at) FROM stdin;
1	\N	skipped		Test empty	\N	Phone number is empty	2026-07-06 19:54:43.365+00	2026-07-06 19:54:43.365+00
2	\N	skipped	12345	Test invalid	\N	Invalid phone number format	2026-07-06 19:54:43.592+00	2026-07-06 19:54:43.592+00
3	1	skipped		Absent alert for student Student 6A-2	\N	Parent phone number is empty	2026-07-06 19:54:44.322+00	2026-07-06 19:54:44.322+00
4	1	skipped	12345	*Test Title*\n\nTest Message body	\N	Invalid phone number format	2026-07-06 19:54:46.499+00	2026-07-06 19:54:46.499+00
5	1	failed	919876543210	*Test Title*\n\nTest Message body	\N	{"error":{"message":"(#131030) Recipient phone number not in allowed list","code":131030,"type":"OAuthException","error_data":{"messaging_product":"whatsapp","details":"Recipient phone number not in allowed list: Add recipient phone number to recipient list and try again."},"fbtrace_id":"AreW_NEz_b6_ZeQdUo3qNyg"}}	2026-07-06 19:54:47.507+00	2026-07-06 19:54:47.507+00
6	1	skipped		Absent alert for student Priya	\N	Parent phone number is empty	2026-07-07 05:05:22.632+00	2026-07-07 05:05:22.632+00
7	1	skipped		Absent alert for student Priya	\N	Parent phone number is empty	2026-07-07 14:48:33.286+00	2026-07-07 14:48:33.286+00
8	1	skipped		Absent alert for student Priya	\N	Parent phone number is empty	2026-07-07 14:48:45.451+00	2026-07-07 14:48:45.451+00
9	1	skipped		Absent alert for student Priya	\N	Parent phone number is empty	2026-07-07 14:48:57.377+00	2026-07-07 14:48:57.377+00
10	1	skipped		Absent alert for student Priya	\N	Parent phone number is empty	2026-07-07 14:49:14.44+00	2026-07-07 14:49:14.44+00
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Name: academic_years_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.academic_years_id_seq', 1, true);


--
-- Name: ai_chat_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_chat_logs_id_seq', 18, true);


--
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendances_id_seq', 43, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.classes_id_seq', 9, true);


--
-- Name: drivers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.drivers_id_seq', 2, true);


--
-- Name: exam_masters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exam_masters_id_seq', 1, false);


--
-- Name: exam_subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exam_subjects_id_seq', 11, true);


--
-- Name: exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exams_id_seq', 3, true);


--
-- Name: families_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.families_id_seq', 1, false);


--
-- Name: feedbacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.feedbacks_id_seq', 1, false);


--
-- Name: game_session_players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.game_session_players_id_seq', 5, true);


--
-- Name: game_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.game_sessions_id_seq', 5, true);


--
-- Name: group_chat_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.group_chat_members_id_seq', 11, true);


--
-- Name: group_chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.group_chat_messages_id_seq', 4, true);


--
-- Name: group_chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.group_chats_id_seq', 1, true);


--
-- Name: homework_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.homework_submissions_id_seq', 1, false);


--
-- Name: homeworks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.homeworks_id_seq', 1, true);


--
-- Name: lost_found_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lost_found_items_id_seq', 1, false);


--
-- Name: notification_acks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_acks_id_seq', 5, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 5, true);


--
-- Name: parents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parents_id_seq', 1, false);


--
-- Name: player_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.player_answers_id_seq', 20, true);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_questions_id_seq', 25, true);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quizzes_id_seq', 5, true);


--
-- Name: report_card_marks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.report_card_marks_id_seq', 14, true);


--
-- Name: report_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.report_cards_id_seq', 5, true);


--
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schools_id_seq', 1, true);


--
-- Name: sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sections_id_seq', 15, true);


--
-- Name: student_enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_enrollments_id_seq', 1, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.students_id_seq', 40, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subjects_id_seq', 5, true);


--
-- Name: teacher_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.teacher_assignments_id_seq', 10, true);


--
-- Name: teacher_class_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.teacher_class_sessions_id_seq', 1, true);


--
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.teachers_id_seq', 21, true);


--
-- Name: timetables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.timetables_id_seq', 49, true);


--
-- Name: token_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.token_accounts_id_seq', 2, true);


--
-- Name: token_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.token_policies_id_seq', 10, true);


--
-- Name: token_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.token_transactions_id_seq', 20, true);


--
-- Name: transport_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transport_requests_id_seq', 1, false);


--
-- Name: trip_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.trip_locations_id_seq', 810, true);


--
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.trips_id_seq', 8, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 68, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 2, true);


--
-- Name: voice_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.voice_logs_id_seq', 1, false);


--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.whatsapp_logs_id_seq', 10, true);


--
-- Name: academic_years academic_years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_pkey PRIMARY KEY (id);


--
-- Name: academic_years academic_years_school_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_school_id_name_key UNIQUE (school_id, name);


--
-- Name: ai_chat_logs ai_chat_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_logs
    ADD CONSTRAINT ai_chat_logs_pkey PRIMARY KEY (id);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_key UNIQUE (user_id);


--
-- Name: exam_masters exam_masters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_masters
    ADD CONSTRAINT exam_masters_pkey PRIMARY KEY (id);


--
-- Name: exam_subjects exam_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_subjects
    ADD CONSTRAINT exam_subjects_pkey PRIMARY KEY (id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: families families_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT families_pkey PRIMARY KEY (id);


--
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- Name: game_session_players game_session_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_session_players
    ADD CONSTRAINT game_session_players_pkey PRIMARY KEY (id);


--
-- Name: game_sessions game_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_pkey PRIMARY KEY (id);


--
-- Name: game_sessions game_sessions_room_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_room_code_key UNIQUE (room_code);


--
-- Name: game_sessions game_sessions_room_code_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_room_code_key1 UNIQUE (room_code);


--
-- Name: group_chat_members group_chat_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_members
    ADD CONSTRAINT group_chat_members_pkey PRIMARY KEY (id);


--
-- Name: group_chat_messages group_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_messages
    ADD CONSTRAINT group_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: group_chats group_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_pkey PRIMARY KEY (id);


--
-- Name: homework_submissions homework_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_pkey PRIMARY KEY (id);


--
-- Name: homeworks homeworks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_pkey PRIMARY KEY (id);


--
-- Name: lost_found_items lost_found_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lost_found_items
    ADD CONSTRAINT lost_found_items_pkey PRIMARY KEY (id);


--
-- Name: notification_acks notification_acks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_acks
    ADD CONSTRAINT notification_acks_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: parents parents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_pkey PRIMARY KEY (id);


--
-- Name: player_answers player_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_answers
    ADD CONSTRAINT player_answers_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: report_card_marks report_card_marks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_marks
    ADD CONSTRAINT report_card_marks_pkey PRIMARY KEY (id);


--
-- Name: report_cards report_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_pkey PRIMARY KEY (id);


--
-- Name: schools schools_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_email_key UNIQUE (email);


--
-- Name: schools schools_email_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_email_key1 UNIQUE (email);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: schools schools_school_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_school_code_key UNIQUE (school_code);


--
-- Name: schools schools_school_code_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_school_code_key1 UNIQUE (school_code);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: student_enrollments student_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_pkey PRIMARY KEY (id);


--
-- Name: student_enrollments student_enrollments_student_id_academic_year_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_student_id_academic_year_id_key UNIQUE (student_id, academic_year_id);


--
-- Name: student_transports student_transports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_transports
    ADD CONSTRAINT student_transports_pkey PRIMARY KEY (student_id);


--
-- Name: students students_aadhar_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_aadhar_no_key UNIQUE (aadhar_no);


--
-- Name: students students_aadhar_no_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_aadhar_no_key1 UNIQUE (aadhar_no);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teacher_assignments teacher_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_pkey PRIMARY KEY (id);


--
-- Name: teacher_class_sessions teacher_class_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id);


--
-- Name: timetables timetables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);


--
-- Name: token_accounts token_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_accounts
    ADD CONSTRAINT token_accounts_pkey PRIMARY KEY (id);


--
-- Name: token_accounts token_accounts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_accounts
    ADD CONSTRAINT token_accounts_user_id_key UNIQUE (user_id);


--
-- Name: token_policies token_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_policies
    ADD CONSTRAINT token_policies_pkey PRIMARY KEY (id);


--
-- Name: token_transactions token_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_transactions
    ADD CONSTRAINT token_transactions_pkey PRIMARY KEY (id);


--
-- Name: transport_requests transport_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_pkey PRIMARY KEY (id);


--
-- Name: trip_locations trip_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_locations
    ADD CONSTRAINT trip_locations_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_phone_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key1 UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: voice_logs voice_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_logs
    ADD CONSTRAINT voice_logs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_logs whatsapp_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_logs
    ADD CONSTRAINT whatsapp_logs_pkey PRIMARY KEY (id);


--
-- Name: academic_years_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX academic_years_school_id ON public.academic_years USING btree (school_id);


--
-- Name: academic_years_school_id_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX academic_years_school_id_name ON public.academic_years USING btree (school_id, name);


--
-- Name: ai_chat_logs_ai_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_logs_ai_type ON public.ai_chat_logs USING btree (ai_type);


--
-- Name: ai_chat_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_logs_created_at ON public.ai_chat_logs USING btree (created_at);


--
-- Name: ai_chat_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_chat_logs_user_id ON public.ai_chat_logs USING btree (user_id);


--
-- Name: attendances_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendances_class_id ON public.attendances USING btree (class_id);


--
-- Name: attendances_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendances_date ON public.attendances USING btree (date);


--
-- Name: attendances_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendances_school_id ON public.attendances USING btree (school_id);


--
-- Name: attendances_section_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendances_section_id ON public.attendances USING btree (section_id);


--
-- Name: attendances_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendances_student_id ON public.attendances USING btree (student_id);


--
-- Name: attendances_student_id_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX attendances_student_id_date ON public.attendances USING btree (student_id, date);


--
-- Name: attendances_teacher_class_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendances_teacher_class_session_id ON public.attendances USING btree (teacher_class_session_id);


--
-- Name: audit_logs_entity_type_entity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_entity_type_entity_id ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: audit_logs_performed_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_performed_by ON public.audit_logs USING btree (performed_by);


--
-- Name: classes_school_id_class_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX classes_school_id_class_name ON public.classes USING btree (school_id, class_name);


--
-- Name: drivers_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX drivers_school_id ON public.drivers USING btree (school_id);


--
-- Name: drivers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX drivers_user_id ON public.drivers USING btree (user_id);


--
-- Name: exam_masters_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_masters_school_id ON public.exam_masters USING btree (school_id);


--
-- Name: exam_masters_school_id_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX exam_masters_school_id_name ON public.exam_masters USING btree (school_id, name);


--
-- Name: exam_subjects_exam_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_subjects_exam_id ON public.exam_subjects USING btree (exam_id);


--
-- Name: exam_subjects_exam_id_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX exam_subjects_exam_id_subject_id ON public.exam_subjects USING btree (exam_id, subject_id);


--
-- Name: exam_subjects_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_subjects_subject_id ON public.exam_subjects USING btree (subject_id);


--
-- Name: exams_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exams_class_id ON public.exams USING btree (class_id);


--
-- Name: exams_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exams_school_id ON public.exams USING btree (school_id);


--
-- Name: exams_school_id_class_id_exam_master_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX exams_school_id_class_id_exam_master_id ON public.exams USING btree (school_id, class_id, exam_master_id);


--
-- Name: exams_school_id_class_id_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX exams_school_id_class_id_name ON public.exams USING btree (school_id, class_id, name);


--
-- Name: families_guardian_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX families_guardian_phone ON public.families USING btree (guardian_phone);


--
-- Name: families_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX families_school_id ON public.families USING btree (school_id);


--
-- Name: feedbacks_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX feedbacks_category ON public.feedbacks USING btree (category);


--
-- Name: feedbacks_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX feedbacks_status ON public.feedbacks USING btree (status);


--
-- Name: feedbacks_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX feedbacks_user_id ON public.feedbacks USING btree (user_id);


--
-- Name: game_session_players_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_session_players_session_id ON public.game_session_players USING btree (session_id);


--
-- Name: game_session_players_session_id_score_finished_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_session_players_session_id_score_finished_at ON public.game_session_players USING btree (session_id, score, finished_at);


--
-- Name: game_session_players_session_id_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX game_session_players_session_id_user_id ON public.game_session_players USING btree (session_id, user_id);


--
-- Name: game_session_players_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_session_players_status ON public.game_session_players USING btree (status);


--
-- Name: game_session_players_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_session_players_user_id ON public.game_session_players USING btree (user_id);


--
-- Name: game_sessions_host_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_sessions_host_user_id ON public.game_sessions USING btree (host_user_id);


--
-- Name: game_sessions_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_sessions_quiz_id ON public.game_sessions USING btree (quiz_id);


--
-- Name: game_sessions_room_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_sessions_room_code ON public.game_sessions USING btree (room_code);


--
-- Name: game_sessions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_sessions_status ON public.game_sessions USING btree (status);


--
-- Name: group_chat_members_group_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chat_members_group_chat_id ON public.group_chat_members USING btree (group_chat_id);


--
-- Name: group_chat_members_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chat_members_role ON public.group_chat_members USING btree (role);


--
-- Name: group_chat_members_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chat_members_user_id ON public.group_chat_members USING btree (user_id);


--
-- Name: group_chat_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chat_messages_created_at ON public.group_chat_messages USING btree (created_at);


--
-- Name: group_chat_messages_group_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chat_messages_group_chat_id ON public.group_chat_messages USING btree (group_chat_id);


--
-- Name: group_chat_messages_group_chat_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chat_messages_group_chat_id_created_at ON public.group_chat_messages USING btree (group_chat_id, created_at);


--
-- Name: group_chat_messages_sender_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chat_messages_sender_user_id ON public.group_chat_messages USING btree (sender_user_id);


--
-- Name: group_chats_section_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chats_section_id ON public.group_chats USING btree (section_id);


--
-- Name: group_chats_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chats_subject_id ON public.group_chats USING btree (subject_id);


--
-- Name: group_chats_teacher_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chats_teacher_id ON public.group_chats USING btree (teacher_id);


--
-- Name: homework_submissions_homework_id_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX homework_submissions_homework_id_student_id ON public.homework_submissions USING btree (homework_id, student_id);


--
-- Name: homework_submissions_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homework_submissions_student_id ON public.homework_submissions USING btree (student_id);


--
-- Name: homeworks_class_id_section_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homeworks_class_id_section_id ON public.homeworks USING btree (class_id, section_id);


--
-- Name: homeworks_homework_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homeworks_homework_date ON public.homeworks USING btree (homework_date);


--
-- Name: homeworks_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homeworks_school_id ON public.homeworks USING btree (school_id);


--
-- Name: homeworks_teacher_assignment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homeworks_teacher_assignment_id ON public.homeworks USING btree (teacher_assignment_id);


--
-- Name: lost_found_items_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lost_found_items_created_by ON public.lost_found_items USING btree (created_by);


--
-- Name: lost_found_items_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lost_found_items_school_id ON public.lost_found_items USING btree (school_id);


--
-- Name: lost_found_items_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lost_found_items_status ON public.lost_found_items USING btree (status);


--
-- Name: lost_found_items_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lost_found_items_type ON public.lost_found_items USING btree (type);


--
-- Name: notification_acks_notification_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_acks_notification_id ON public.notification_acks USING btree (notification_id);


--
-- Name: notification_acks_notification_id_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX notification_acks_notification_id_user_id ON public.notification_acks USING btree (notification_id, user_id);


--
-- Name: notifications_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_class_id ON public.notifications USING btree (class_id);


--
-- Name: notifications_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_school_id ON public.notifications USING btree (school_id);


--
-- Name: notifications_target_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_target_role ON public.notifications USING btree (target_role);


--
-- Name: parents_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parents_student_id ON public.parents USING btree (student_id);


--
-- Name: parents_student_id_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX parents_student_id_user_id ON public.parents USING btree (student_id, user_id);


--
-- Name: parents_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parents_user_id ON public.parents USING btree (user_id);


--
-- Name: player_answers_answered_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX player_answers_answered_at ON public.player_answers USING btree (answered_at);


--
-- Name: player_answers_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX player_answers_question_id ON public.player_answers USING btree (question_id);


--
-- Name: player_answers_session_player_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX player_answers_session_player_id ON public.player_answers USING btree (session_player_id);


--
-- Name: quiz_questions_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quiz_questions_quiz_id ON public.quiz_questions USING btree (quiz_id);


--
-- Name: quiz_questions_quiz_id_order_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX quiz_questions_quiz_id_order_index ON public.quiz_questions USING btree (quiz_id, order_index);


--
-- Name: quizzes_owner_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quizzes_owner_user_id ON public.quizzes USING btree (owner_user_id);


--
-- Name: quizzes_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quizzes_topic ON public.quizzes USING btree (topic);


--
-- Name: report_card_marks_report_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_card_marks_report_card_id ON public.report_card_marks USING btree (report_card_id);


--
-- Name: report_card_marks_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_card_marks_subject_id ON public.report_card_marks USING btree (subject_id);


--
-- Name: report_cards_exam_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_cards_exam_id ON public.report_cards USING btree (exam_id);


--
-- Name: report_cards_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_cards_student_id ON public.report_cards USING btree (student_id);


--
-- Name: report_cards_student_id_exam_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX report_cards_student_id_exam_id ON public.report_cards USING btree (student_id, exam_id);


--
-- Name: schools_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX schools_city ON public.schools USING btree (city);


--
-- Name: schools_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX schools_state ON public.schools USING btree (state);


--
-- Name: schools_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX schools_status ON public.schools USING btree (status);


--
-- Name: sections_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sections_class_id ON public.sections USING btree (class_id);


--
-- Name: sections_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sections_school_id ON public.sections USING btree (school_id);


--
-- Name: sections_school_id_class_id_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sections_school_id_class_id_name ON public.sections USING btree (school_id, class_id, name);


--
-- Name: student_enrollments_academic_year_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_enrollments_academic_year_id ON public.student_enrollments USING btree (academic_year_id);


--
-- Name: student_enrollments_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_enrollments_class_id ON public.student_enrollments USING btree (class_id);


--
-- Name: student_enrollments_section_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_enrollments_section_id ON public.student_enrollments USING btree (section_id);


--
-- Name: student_enrollments_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_enrollments_student_id ON public.student_enrollments USING btree (student_id);


--
-- Name: student_enrollments_student_id_academic_year_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX student_enrollments_student_id_academic_year_id ON public.student_enrollments USING btree (student_id, academic_year_id);


--
-- Name: student_transports_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_transports_school_id ON public.student_transports USING btree (school_id);


--
-- Name: student_transports_vehicle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_transports_vehicle_id ON public.student_transports USING btree (vehicle_id);


--
-- Name: students_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX students_class_id ON public.students USING btree (class_id);


--
-- Name: students_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX students_school_id ON public.students USING btree (school_id);


--
-- Name: students_school_id_admission_no; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX students_school_id_admission_no ON public.students USING btree (school_id, admission_no);


--
-- Name: students_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX students_user_id ON public.students USING btree (user_id);


--
-- Name: subjects_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subjects_school_id ON public.subjects USING btree (school_id);


--
-- Name: subjects_school_id_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX subjects_school_id_name ON public.subjects USING btree (school_id, name);


--
-- Name: teacher_assignments_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_assignments_class_id ON public.teacher_assignments USING btree (class_id);


--
-- Name: teacher_assignments_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_assignments_school_id ON public.teacher_assignments USING btree (school_id);


--
-- Name: teacher_assignments_teacher_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_assignments_teacher_id ON public.teacher_assignments USING btree (teacher_id);


--
-- Name: teacher_assignments_teacher_id_section_id_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX teacher_assignments_teacher_id_section_id_subject_id ON public.teacher_assignments USING btree (teacher_id, section_id, subject_id);


--
-- Name: teacher_class_sessions_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_class_sessions_class_id ON public.teacher_class_sessions USING btree (class_id);


--
-- Name: teacher_class_sessions_section_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_class_sessions_section_id ON public.teacher_class_sessions USING btree (section_id);


--
-- Name: teacher_class_sessions_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_class_sessions_started_at ON public.teacher_class_sessions USING btree (started_at);


--
-- Name: teacher_class_sessions_teacher_assignment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_class_sessions_teacher_assignment_id ON public.teacher_class_sessions USING btree (teacher_assignment_id);


--
-- Name: teacher_class_sessions_teacher_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_class_sessions_teacher_id ON public.teacher_class_sessions USING btree (teacher_id);


--
-- Name: teacher_class_sessions_timetable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teacher_class_sessions_timetable_id ON public.teacher_class_sessions USING btree (timetable_id);


--
-- Name: teachers_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teachers_school_id ON public.teachers USING btree (school_id);


--
-- Name: teachers_school_id_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX teachers_school_id_employee_id ON public.teachers USING btree (school_id, employee_id);


--
-- Name: teachers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teachers_user_id ON public.teachers USING btree (user_id);


--
-- Name: timetables_class_id_section_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX timetables_class_id_section_id ON public.timetables USING btree (class_id, section_id);


--
-- Name: timetables_day_of_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX timetables_day_of_week ON public.timetables USING btree (day_of_week);


--
-- Name: timetables_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX timetables_school_id ON public.timetables USING btree (school_id);


--
-- Name: timetables_teacher_assignment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX timetables_teacher_assignment_id ON public.timetables USING btree (teacher_assignment_id);


--
-- Name: token_accounts_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX token_accounts_expires_at ON public.token_accounts USING btree (expires_at);


--
-- Name: token_accounts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX token_accounts_user_id ON public.token_accounts USING btree (user_id);


--
-- Name: token_policies_role; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX token_policies_role ON public.token_policies USING btree (role);


--
-- Name: token_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX token_transactions_created_at ON public.token_transactions USING btree (created_at);


--
-- Name: token_transactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX token_transactions_type ON public.token_transactions USING btree (type);


--
-- Name: token_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX token_transactions_user_id ON public.token_transactions USING btree (user_id);


--
-- Name: transport_requests_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transport_requests_school_id ON public.transport_requests USING btree (school_id);


--
-- Name: transport_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transport_requests_status ON public.transport_requests USING btree (status);


--
-- Name: transport_requests_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transport_requests_student_id ON public.transport_requests USING btree (student_id);


--
-- Name: trip_locations_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trip_locations_created_at ON public.trip_locations USING btree (created_at);


--
-- Name: trip_locations_trip_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trip_locations_trip_id ON public.trip_locations USING btree (trip_id);


--
-- Name: trips_driver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trips_driver_id ON public.trips USING btree (driver_id);


--
-- Name: trips_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trips_school_id ON public.trips USING btree (school_id);


--
-- Name: trips_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trips_status ON public.trips USING btree (status);


--
-- Name: trips_vehicle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trips_vehicle_id ON public.trips USING btree (vehicle_id);


--
-- Name: uq_group_chat_member; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_group_chat_member ON public.group_chat_members USING btree (group_chat_id, user_id);


--
-- Name: uq_player_answer_session_question; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_player_answer_session_question ON public.player_answers USING btree (session_player_id, question_id);


--
-- Name: uq_teacher_subject_section_chat; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_teacher_subject_section_chat ON public.group_chats USING btree (teacher_id, subject_id, section_id);


--
-- Name: users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_phone ON public.users USING btree (phone);


--
-- Name: users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role ON public.users USING btree (role);


--
-- Name: users_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_school_id ON public.users USING btree (school_id);


--
-- Name: users_school_id_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_school_id_username ON public.users USING btree (school_id, username);


--
-- Name: vehicles_driver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vehicles_driver_id ON public.vehicles USING btree (driver_id);


--
-- Name: vehicles_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vehicles_school_id ON public.vehicles USING btree (school_id);


--
-- Name: vehicles_school_id_vehicle_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX vehicles_school_id_vehicle_number ON public.vehicles USING btree (school_id, vehicle_number);


--
-- Name: voice_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_logs_created_at ON public.voice_logs USING btree (created_at);


--
-- Name: voice_logs_purpose; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_logs_purpose ON public.voice_logs USING btree (purpose);


--
-- Name: voice_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX voice_logs_user_id ON public.voice_logs USING btree (user_id);


--
-- Name: whatsapp_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_logs_created_at ON public.whatsapp_logs USING btree (created_at);


--
-- Name: whatsapp_logs_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_logs_phone ON public.whatsapp_logs USING btree (phone);


--
-- Name: whatsapp_logs_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_logs_school_id ON public.whatsapp_logs USING btree (school_id);


--
-- Name: whatsapp_logs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_logs_status ON public.whatsapp_logs USING btree (status);


--
-- Name: ai_chat_logs ai_chat_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_logs
    ADD CONSTRAINT ai_chat_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: attendances attendances_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: attendances attendances_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendances attendances_teacher_class_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_teacher_class_session_id_fkey FOREIGN KEY (teacher_class_session_id) REFERENCES public.teacher_class_sessions(id);


--
-- Name: attendances attendances_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: classes classes_class_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_class_teacher_id_fkey FOREIGN KEY (class_teacher_id) REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: classes classes_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: drivers drivers_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: drivers drivers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exam_masters exam_masters_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_masters
    ADD CONSTRAINT exam_masters_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: exam_subjects exam_subjects_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_subjects
    ADD CONSTRAINT exam_subjects_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exam_subjects exam_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_subjects
    ADD CONSTRAINT exam_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE;


--
-- Name: exams exams_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE;


--
-- Name: exams exams_exam_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_exam_master_id_fkey FOREIGN KEY (exam_master_id) REFERENCES public.exam_masters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: exams exams_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: families families_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT families_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: feedbacks feedbacks_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: feedbacks feedbacks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: game_session_players game_session_players_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_session_players
    ADD CONSTRAINT game_session_players_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.game_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: game_session_players game_session_players_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_session_players
    ADD CONSTRAINT game_session_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: game_sessions game_sessions_host_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_host_user_id_fkey FOREIGN KEY (host_user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: game_sessions game_sessions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON UPDATE CASCADE;


--
-- Name: group_chat_members group_chat_members_group_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_members
    ADD CONSTRAINT group_chat_members_group_chat_id_fkey FOREIGN KEY (group_chat_id) REFERENCES public.group_chats(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_chat_members group_chat_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_members
    ADD CONSTRAINT group_chat_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: group_chat_messages group_chat_messages_group_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_messages
    ADD CONSTRAINT group_chat_messages_group_chat_id_fkey FOREIGN KEY (group_chat_id) REFERENCES public.group_chats(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_chat_messages group_chat_messages_sender_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chat_messages
    ADD CONSTRAINT group_chat_messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: group_chats group_chats_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE;


--
-- Name: group_chats group_chats_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE;


--
-- Name: group_chats group_chats_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE;


--
-- Name: group_chats group_chats_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: homework_submissions homework_submissions_homework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_homework_id_fkey FOREIGN KEY (homework_id) REFERENCES public.homeworks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homework_submissions homework_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE;


--
-- Name: homeworks homeworks_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homeworks homeworks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homeworks homeworks_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: homeworks homeworks_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homeworks homeworks_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homeworks homeworks_teacher_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_teacher_assignment_id_fkey FOREIGN KEY (teacher_assignment_id) REFERENCES public.teacher_assignments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lost_found_items lost_found_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lost_found_items
    ADD CONSTRAINT lost_found_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lost_found_items lost_found_items_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lost_found_items
    ADD CONSTRAINT lost_found_items_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_acks notification_acks_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_acks
    ADD CONSTRAINT notification_acks_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: notifications notifications_sender_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: player_answers player_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_answers
    ADD CONSTRAINT player_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id) ON UPDATE CASCADE;


--
-- Name: player_answers player_answers_session_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_answers
    ADD CONSTRAINT player_answers_session_player_id_fkey FOREIGN KEY (session_player_id) REFERENCES public.game_session_players(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quizzes quizzes_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: report_card_marks report_card_marks_report_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_marks
    ADD CONSTRAINT report_card_marks_report_card_id_fkey FOREIGN KEY (report_card_id) REFERENCES public.report_cards(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_card_marks report_card_marks_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_card_marks
    ADD CONSTRAINT report_card_marks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE;


--
-- Name: report_cards report_cards_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE;


--
-- Name: report_cards report_cards_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_cards report_cards_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: report_cards report_cards_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE;


--
-- Name: sections sections_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sections sections_class_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_class_teacher_id_fkey FOREIGN KEY (class_teacher_id) REFERENCES public.teachers(id);


--
-- Name: sections sections_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_enrollments student_enrollments_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE CASCADE;


--
-- Name: student_enrollments student_enrollments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: student_enrollments student_enrollments_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;


--
-- Name: student_enrollments student_enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_transports student_transports_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_transports
    ADD CONSTRAINT student_transports_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_transports student_transports_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_transports
    ADD CONSTRAINT student_transports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_transports student_transports_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_transports
    ADD CONSTRAINT student_transports_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: students students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subjects subjects_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_teacher_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_teacher_assignment_id_fkey FOREIGN KEY (teacher_assignment_id) REFERENCES public.teacher_assignments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_timetable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_timetable_id_fkey FOREIGN KEY (timetable_id) REFERENCES public.timetables(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teachers teachers_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: teachers teachers_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_teacher_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_teacher_assignment_id_fkey FOREIGN KEY (teacher_assignment_id) REFERENCES public.teacher_assignments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: token_accounts token_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_accounts
    ADD CONSTRAINT token_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: token_policies token_policies_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_policies
    ADD CONSTRAINT token_policies_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: token_transactions token_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_transactions
    ADD CONSTRAINT token_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transport_requests transport_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: transport_requests transport_requests_current_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_current_vehicle_id_fkey FOREIGN KEY (current_vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_requested_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_requested_vehicle_id_fkey FOREIGN KEY (requested_vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transport_requests transport_requests_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transport_requests transport_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trip_locations trip_locations_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_locations
    ADD CONSTRAINT trip_locations_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trips trips_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trips trips_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trips trips_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vehicles vehicles_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vehicles vehicles_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voice_logs voice_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_logs
    ADD CONSTRAINT voice_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: whatsapp_logs whatsapp_logs_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_logs
    ADD CONSTRAINT whatsapp_logs_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict SbcxuyNs9euHXI7krGoYBuvrcWjmvQdYCZGMaCqjgkQb7B44IvaybxL3u790bXu

