--
-- PostgreSQL database dump
--

\restrict 6UscsUxUPQgWdZbsO5hWjQKCSilLszLIH8wTfMjxkVqlrsgtvrwTbMz2C0Zue3d

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: enum_ai_chat_logs_ai_type; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TYPE public.enum_ai_chat_logs_ai_type OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_attendances_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_attendances_status AS ENUM (
    'present',
    'absent',
    'leave',
    'on_duty'
);


ALTER TYPE public.enum_attendances_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_audit_logs_action; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_audit_logs_action AS ENUM (
    'approve',
    'reject'
);


ALTER TYPE public.enum_audit_logs_action OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_audit_logs_entity_type; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_audit_logs_entity_type AS ENUM (
    'student',
    'teacher',
    'parent'
);


ALTER TYPE public.enum_audit_logs_entity_type OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_game_session_players_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_game_session_players_status AS ENUM (
    'JOINED',
    'READY',
    'PLAYING',
    'DISCONNECTED',
    'FINISHED'
);


ALTER TYPE public.enum_game_session_players_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_game_sessions_mode; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_game_sessions_mode AS ENUM (
    'SINGLE',
    'MULTI'
);


ALTER TYPE public.enum_game_sessions_mode OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_game_sessions_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_game_sessions_status AS ENUM (
    'LOBBY',
    'IN_PROGRESS',
    'FINISHED',
    'CANCELLED'
);


ALTER TYPE public.enum_game_sessions_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_group_chat_members_role; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_group_chat_members_role AS ENUM (
    'teacher',
    'student'
);


ALTER TYPE public.enum_group_chat_members_role OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_group_chat_messages_message_type; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_group_chat_messages_message_type AS ENUM (
    'text',
    'image'
);


ALTER TYPE public.enum_group_chat_messages_message_type OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_notification_acks_user_role; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_notification_acks_user_role AS ENUM (
    'teacher',
    'student'
);


ALTER TYPE public.enum_notification_acks_user_role OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_notifications_sender_role; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_notifications_sender_role AS ENUM (
    'school_admin',
    'teacher'
);


ALTER TYPE public.enum_notifications_sender_role OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_notifications_target_role; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_notifications_target_role AS ENUM (
    'teacher',
    'student',
    'all'
);


ALTER TYPE public.enum_notifications_target_role OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_parents_approval_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_parents_approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_parents_approval_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_parents_relation_type; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_parents_relation_type AS ENUM (
    'mother',
    'father',
    'guardian'
);


ALTER TYPE public.enum_parents_relation_type OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_quizzes_difficulty; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_quizzes_difficulty AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD',
    'ADAPTIVE'
);


ALTER TYPE public.enum_quizzes_difficulty OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_schools_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_schools_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'expired'
);


ALTER TYPE public.enum_schools_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_students_approval_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_students_approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_students_approval_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_students_gender; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_students_gender AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE public.enum_students_gender OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_students_residential_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_students_residential_status AS ENUM (
    'dayscholar',
    'hosteler'
);


ALTER TYPE public.enum_students_residential_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_subjects_category; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_subjects_category AS ENUM (
    'theory',
    'practical',
    'both'
);


ALTER TYPE public.enum_subjects_category OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_teachers_approval_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_teachers_approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_teachers_approval_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_teachers_gender; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_teachers_gender AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE public.enum_teachers_gender OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_timetables_day_of_week; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_timetables_day_of_week AS ENUM (
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
);


ALTER TYPE public.enum_timetables_day_of_week OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_token_policies_role; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_token_policies_role AS ENUM (
    'student',
    'teacher'
);


ALTER TYPE public.enum_token_policies_role OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_token_transactions_type; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_token_transactions_type AS ENUM (
    'subscription_grant',
    'usage',
    'refund',
    'bonus',
    'admin_adjustment',
    'expiry'
);


ALTER TYPE public.enum_token_transactions_type OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_transport_requests_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_transport_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_transport_requests_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_trips_status; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_trips_status AS ENUM (
    'active',
    'completed'
);


ALTER TYPE public.enum_trips_status OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_trips_trip_type; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_trips_trip_type AS ENUM (
    'pickup',
    'drop'
);


ALTER TYPE public.enum_trips_trip_type OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_users_role AS ENUM (
    'super_admin',
    'school_admin',
    'teacher',
    'student',
    'driver'
);


ALTER TYPE public.enum_users_role OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: enum_voice_logs_purpose; Type: TYPE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TYPE public.enum_voice_logs_purpose AS ENUM (
    'dictation',
    'question',
    'command',
    'revision',
    'general'
);


ALTER TYPE public.enum_voice_logs_purpose OWNER TO ucpkmvrvwzoqz0wvousr;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_chat_logs; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.ai_chat_logs OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: ai_chat_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.ai_chat_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_chat_logs_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: ai_chat_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.ai_chat_logs_id_seq OWNED BY public.ai_chat_logs.id;


--
-- Name: attendances; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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
    updated_by bigint
);


ALTER TABLE public.attendances OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.attendances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendances_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.audit_logs OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: classes; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.classes OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.classes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classes_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.drivers OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.drivers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drivers_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.drivers_id_seq OWNED BY public.drivers.id;


--
-- Name: exam_masters; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TABLE public.exam_masters (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.exam_masters OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: exam_masters_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.exam_masters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_masters_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: exam_masters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.exam_masters_id_seq OWNED BY public.exam_masters.id;


--
-- Name: exam_subjects; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.exam_subjects OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: exam_subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.exam_subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_subjects_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: exam_subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.exam_subjects_id_seq OWNED BY public.exam_subjects.id;


--
-- Name: exams; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TABLE public.exams (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    class_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    exam_master_id bigint,
    is_locked boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.exams OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: exams_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.exams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exams_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.exams_id_seq OWNED BY public.exams.id;


--
-- Name: families; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.families OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: families_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.families_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.families_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: families_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.families_id_seq OWNED BY public.families.id;


--
-- Name: game_session_players; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.game_session_players OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: game_session_players_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.game_session_players_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_session_players_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: game_session_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.game_session_players_id_seq OWNED BY public.game_session_players.id;


--
-- Name: game_sessions; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.game_sessions OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: game_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.game_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_sessions_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: game_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.game_sessions_id_seq OWNED BY public.game_sessions.id;


--
-- Name: group_chat_members; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.group_chat_members OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: group_chat_members_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.group_chat_members_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_chat_members_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: group_chat_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.group_chat_members_id_seq OWNED BY public.group_chat_members.id;


--
-- Name: group_chat_messages; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.group_chat_messages OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: group_chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.group_chat_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_chat_messages_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: group_chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.group_chat_messages_id_seq OWNED BY public.group_chat_messages.id;


--
-- Name: group_chats; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.group_chats OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: group_chats_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.group_chats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_chats_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: group_chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.group_chats_id_seq OWNED BY public.group_chats.id;


--
-- Name: homework_submissions; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.homework_submissions OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: homework_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.homework_submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.homework_submissions_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: homework_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.homework_submissions_id_seq OWNED BY public.homework_submissions.id;


--
-- Name: homeworks; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.homeworks OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: homeworks_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.homeworks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.homeworks_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: homeworks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.homeworks_id_seq OWNED BY public.homeworks.id;


--
-- Name: notification_acks; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TABLE public.notification_acks (
    id bigint NOT NULL,
    notification_id bigint NOT NULL,
    user_id bigint NOT NULL,
    user_role public.enum_notification_acks_user_role NOT NULL,
    acknowledged_at timestamp with time zone NOT NULL
);


ALTER TABLE public.notification_acks OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: notification_acks_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.notification_acks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_acks_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: notification_acks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.notification_acks_id_seq OWNED BY public.notification_acks.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.notifications OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: parents; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.parents OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: parents_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.parents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parents_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: parents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.parents_id_seq OWNED BY public.parents.id;


--
-- Name: player_answers; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.player_answers OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: player_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.player_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_answers_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: player_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.player_answers_id_seq OWNED BY public.player_answers.id;


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.quiz_questions OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: quiz_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.quiz_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_questions_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: quiz_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.quiz_questions_id_seq OWNED BY public.quiz_questions.id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.quizzes OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.quizzes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quizzes_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- Name: report_card_marks; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.report_card_marks OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: report_card_marks_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.report_card_marks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_card_marks_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: report_card_marks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.report_card_marks_id_seq OWNED BY public.report_card_marks.id;


--
-- Name: report_cards; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.report_cards OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: report_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.report_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_cards_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: report_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.report_cards_id_seq OWNED BY public.report_cards.id;


--
-- Name: schools; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.schools OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.schools_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schools_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
-- Name: sections; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.sections OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: sections_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sections_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.sections_id_seq OWNED BY public.sections.id;


--
-- Name: student_transports; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.student_transports OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: students; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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
    family_id bigint
);


ALTER TABLE public.students OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.students_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.subjects OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: teacher_assignments; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.teacher_assignments OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: teacher_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.teacher_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_assignments_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: teacher_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.teacher_assignments_id_seq OWNED BY public.teacher_assignments.id;


--
-- Name: teacher_class_sessions; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.teacher_class_sessions OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: teacher_class_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.teacher_class_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_class_sessions_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: teacher_class_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.teacher_class_sessions_id_seq OWNED BY public.teacher_class_sessions.id;


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.teachers OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.teachers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teachers_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- Name: timetables; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.timetables OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: timetables_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.timetables_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.timetables_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: timetables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.timetables_id_seq OWNED BY public.timetables.id;


--
-- Name: token_accounts; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TABLE public.token_accounts (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.token_accounts OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: token_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.token_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.token_accounts_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: token_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.token_accounts_id_seq OWNED BY public.token_accounts.id;


--
-- Name: token_policies; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE TABLE public.token_policies (
    id bigint NOT NULL,
    role public.enum_token_policies_role NOT NULL,
    monthly_tokens integer DEFAULT 0 NOT NULL,
    updated_by bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.token_policies OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: token_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.token_policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.token_policies_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: token_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.token_policies_id_seq OWNED BY public.token_policies.id;


--
-- Name: token_transactions; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.token_transactions OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: token_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.token_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.token_transactions_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: token_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.token_transactions_id_seq OWNED BY public.token_transactions.id;


--
-- Name: transport_requests; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.transport_requests OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: transport_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.transport_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transport_requests_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: transport_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.transport_requests_id_seq OWNED BY public.transport_requests.id;


--
-- Name: trip_locations; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.trip_locations OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: trip_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.trip_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_locations_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: trip_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.trip_locations_id_seq OWNED BY public.trip_locations.id;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.trips OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.trips_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trips_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.users OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.vehicles OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.vehicles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: voice_logs; Type: TABLE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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


ALTER TABLE public.voice_logs OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: voice_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE SEQUENCE public.voice_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voice_logs_id_seq OWNER TO ucpkmvrvwzoqz0wvousr;

--
-- Name: voice_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER SEQUENCE public.voice_logs_id_seq OWNED BY public.voice_logs.id;


--
-- Name: ai_chat_logs id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.ai_chat_logs ALTER COLUMN id SET DEFAULT nextval('public.ai_chat_logs_id_seq'::regclass);


--
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- Name: drivers id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.drivers ALTER COLUMN id SET DEFAULT nextval('public.drivers_id_seq'::regclass);


--
-- Name: exam_masters id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exam_masters ALTER COLUMN id SET DEFAULT nextval('public.exam_masters_id_seq'::regclass);


--
-- Name: exam_subjects id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exam_subjects ALTER COLUMN id SET DEFAULT nextval('public.exam_subjects_id_seq'::regclass);


--
-- Name: exams id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exams ALTER COLUMN id SET DEFAULT nextval('public.exams_id_seq'::regclass);


--
-- Name: families id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.families ALTER COLUMN id SET DEFAULT nextval('public.families_id_seq'::regclass);


--
-- Name: game_session_players id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.game_session_players ALTER COLUMN id SET DEFAULT nextval('public.game_session_players_id_seq'::regclass);


--
-- Name: game_sessions id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.game_sessions ALTER COLUMN id SET DEFAULT nextval('public.game_sessions_id_seq'::regclass);


--
-- Name: group_chat_members id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chat_members ALTER COLUMN id SET DEFAULT nextval('public.group_chat_members_id_seq'::regclass);


--
-- Name: group_chat_messages id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chat_messages ALTER COLUMN id SET DEFAULT nextval('public.group_chat_messages_id_seq'::regclass);


--
-- Name: group_chats id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chats ALTER COLUMN id SET DEFAULT nextval('public.group_chats_id_seq'::regclass);


--
-- Name: homework_submissions id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homework_submissions ALTER COLUMN id SET DEFAULT nextval('public.homework_submissions_id_seq'::regclass);


--
-- Name: homeworks id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homeworks ALTER COLUMN id SET DEFAULT nextval('public.homeworks_id_seq'::regclass);


--
-- Name: notification_acks id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.notification_acks ALTER COLUMN id SET DEFAULT nextval('public.notification_acks_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: parents id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.parents ALTER COLUMN id SET DEFAULT nextval('public.parents_id_seq'::regclass);


--
-- Name: player_answers id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.player_answers ALTER COLUMN id SET DEFAULT nextval('public.player_answers_id_seq'::regclass);


--
-- Name: quiz_questions id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN id SET DEFAULT nextval('public.quiz_questions_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- Name: report_card_marks id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_card_marks ALTER COLUMN id SET DEFAULT nextval('public.report_card_marks_id_seq'::regclass);


--
-- Name: report_cards id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_cards ALTER COLUMN id SET DEFAULT nextval('public.report_cards_id_seq'::regclass);


--
-- Name: schools id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
-- Name: sections id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.sections ALTER COLUMN id SET DEFAULT nextval('public.sections_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: teacher_assignments id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_assignments ALTER COLUMN id SET DEFAULT nextval('public.teacher_assignments_id_seq'::regclass);


--
-- Name: teacher_class_sessions id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_class_sessions ALTER COLUMN id SET DEFAULT nextval('public.teacher_class_sessions_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Name: timetables id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.timetables ALTER COLUMN id SET DEFAULT nextval('public.timetables_id_seq'::regclass);


--
-- Name: token_accounts id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_accounts ALTER COLUMN id SET DEFAULT nextval('public.token_accounts_id_seq'::regclass);


--
-- Name: token_policies id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_policies ALTER COLUMN id SET DEFAULT nextval('public.token_policies_id_seq'::regclass);


--
-- Name: token_transactions id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_transactions ALTER COLUMN id SET DEFAULT nextval('public.token_transactions_id_seq'::regclass);


--
-- Name: transport_requests id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.transport_requests ALTER COLUMN id SET DEFAULT nextval('public.transport_requests_id_seq'::regclass);


--
-- Name: trip_locations id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.trip_locations ALTER COLUMN id SET DEFAULT nextval('public.trip_locations_id_seq'::regclass);


--
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: voice_logs id; Type: DEFAULT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.voice_logs ALTER COLUMN id SET DEFAULT nextval('public.voice_logs_id_seq'::regclass);


--
-- Data for Name: ai_chat_logs; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.ai_chat_logs (id, user_id, user_query, ai_response, tokens_used, model_used, ai_type, class_level, created_at, updated_at) FROM stdin;
1	3	{"classLevel":"6","chapter":"grammar","marks":50}	Here is a CBSE-style question paper for Class 6 General (Grammar), following your specifications:\n\n---\n\n**CENTRAL BOARD OF SECONDARY EDUCATION**\n**SAMPLE QUESTION PAPER**\n\n**CLASS: VI**\n**SUBJECT: GENERAL (GRAMMAR)**\n**TIME ALLOWED:** 2 Hours\n**MAXIMUM MARKS:** 50\n\n**General Instructions:**\n1.  This paper consists of three Sections: A, B, and C.\n2.  All questions are compulsory.\n3.  Marks are indicated against each question.\n4.  Read the questions carefully before answering.\n\n---\n\n**SECTION A: MULTIPLE CHOICE QUESTIONS (MCQs) (15 Marks)**\n\n**(Each question carries 1 mark)**\n\n**Choose the correct option for each question.**\n\n1.  Which of the following is a Noun?\n    a) happy\n    b) run\n    c) book\n    d) quickly\n\n2.  Identify the Pronoun in the following sentence: "She is reading a story."\n    a) She\n    b) is\n    c) reading\n    d) story\n\n3.  Which word describes a noun?\n    a) Verb\n    b) Adjective\n    c) Adverb\n    d) Pronoun\n\n4.  "Big", "small", "tall" are examples of:\n    a) Verbs\n    b) Adverbs\n    c) Adjectives\n    d) Nouns\n\n5.  The opposite of "fast" is:\n    a) slow\n    b) quick\n    c) rapid\n    d) speedy\n\n6.  A word that shows action is called a:\n    a) Noun\n    b) Verb\n    c) Adjective\n    d) Preposition\n\n7.  Identify the Verb in the sentence: "The cat slept on the mat."\n    a) The\n    b) cat\n    c) slept\n    d) mat\n\n8.  Which of the following is a Singular Noun?\n    a) children\n    b) mice\n    c) box\n    d) leaves\n\n9.  The word "beautifully" is a:\n    a) Noun\n    b) Verb\n    c) Adjective\n    d) Adverb\n\n10. Which word tells us *how*, *when*, or *where* an action is done?\n    a) Noun\n    b) Pronoun\n    c) Adverb\n    d) Conjunction\n\n11. The sentence "Ram is playing cricket" is in which tense?\n    a) Past Tense\n    b) Present Tense\n    c) Future Tense\n    d) None of the above\n\n12. Which of the following is a Plural Noun?\n    a) apple\n    b) tree\n    c) benches\n    d) flower\n\n13. The word "and" is a:\n    a) Preposition\n    b) Conjunction\n    c) Interjection\n    d) Verb\n\n14. Choose the correct Article for the blank: "I saw ______ elephant yesterday."\n    a) a\n    b) an\n    c) the\n    d) no article\n\n15. Identify the Adjective in the sentence: "The blue car is fast."\n    a) The\n    b) blue\n    c) car\n    d) is\n\n---\n\n**SECTION B: SHORT ANSWER QUESTIONS (20 Marks)**\n\n**(Answer all questions. Each question carries 2 marks.)**\n\n16. Define Noun and give two examples.\n17. Write the plural form of the following nouns:\n    a) child\n    b) box\n18. Identify the Pronoun and the Verb in the sentence: "He gave her a gift."\n19. Rewrite the following sentence in the Past Tense: "They are going to the park."\n20. Fill in the blank with a suitable Adjective: "The _________ boy helped the old lady."\n21. Identify the Adverb in the sentence: "The dog barked loudly."\n22. Underline the Preposition in the following sentence: "The book is on the table."\n23. Combine the following sentences using the conjunction "but": "She is tired. She wants to play."\n24. Fill in the blank with the correct Article (a/an/the): "She bought ______ new book."\n25. Give one example of an Interjection.\n\n---\n\n**SECTION C: LONG ANSWER QUESTIONS (15 Marks)**\n\n**(Answer all questions. Each question carries 5 marks.)**\n\n26. Read the following passage and answer the questions below:\n\n    "Riya is a bright student. She always wakes up early in the morning. Today, she finished her homework quickly. Her mother is cooking delicious food in the kitchen. Riya will help her later."\n\n    a) Identify two Nouns from the passage.\n    b) Identify one Pronoun from the passage.\n    c) Identify one Verb from the passage.\n    d) Identify one Adverb from the passage.\n    e) Rewrite the sentence "Her mother is cooking delicious food in the kitchen" in the Future Tense.\n\n27. **(Choose ONE of the following)**\n\n    **(a) Rewrite the following sentences, correcting the grammatical errors:**\n    i)  The dogs barks loudly.\n    ii) She go to school yesterday.\n    iii) He is more taller than me.\n    iv) They is playing football.\n    v) I seen him last week.\n\n    **(b) Write a short paragraph (4-5 sentences) about your favourite game. Use at least three different types of words you have learned (e.g., Noun, Verb, Adjective, Adverb).**\n\n28. **(Choose ONE of the following)**\n\n    **(a) Fill in the blanks with appropriate words and identify the part of speech of the underlined word:**\n    i)  The cat slept _______ the mat. (Underline: the)\n    ii) My friend is very _______. (Choose an Adjective)\n    iii) The children shouted _______. (Choose an Adverb)\n    iv) She likes to read ______ play. (Choose a Conjunction)\n    v)  _______! That was a great shot! (Choose an Interjection)\n\n    **(b) Define and give examples of the following Parts of Speech:**\n    i)  Adjective\n    ii) Verb\n    iii) Conjunction\n\n---\n**END OF PAPER**\n\n---\n\n**Answer Key (for Teacher's use - not to be provided to students)**\n\n**SECTION A: MCQs (15 Marks)**\n1.  c) book\n2.  a) She\n3.  b) Adjective\n4.  c) Adjectives\n5.  a) slow\n6.  b) Verb\n7.  c) slept\n8.  c) box\n9.  d) Adverb\n10. c) Adverb\n11. b) Present Tense\n12. c) benches\n13. b) Conjunction\n14. b) an\n15. b) blue\n\n**SECTION B: SHORT ANSWER QUESTIONS (20 Marks)**\n16. **Noun:** A noun is a word that names a person, place, thing, or idea. (1 mark for definition, 1 mark for 2 examples like: *boy, city, chair, happiness*)\n17. a) children (1 mark) b) boxes (1 mark)\n18. Pronoun: He (1 mark), Verb: gave (1 mark)\n19. They were going to the park. (2 marks)\n20. (Example) *kind* / *helpful* / *smart* / *tall* / *young* (Any suitable adjective gets 2 marks)\n21. Adverb: loudly (2 marks)\n22. The book is **on** the table. (Preposition: on - 2 marks)\n23. She is tired, but she wants to play. (2 marks)\n24. a (2 marks)\n25. (Example) Wow! / Ouch! / Hurray! (Any suitable interjection gets 2 marks)\n\n**SECTION C: LONG ANSWER QUESTIONS (15 Marks)**\n\n26. **(5 Marks)**\n    a) Two Nouns: Riya, student, morning, homework, mother, food, kitchen (any two - 1 mark each = 2 marks)\n    b) One Pronoun: She, her (any one - 1 mark)\n    c) One Verb: wakes, finished, cooking, will help (any one - 1 mark)\n    d) One Adverb: early, quickly, later (any one - 1 mark)\n    e) Her mother will cook delicious food in the kitchen. (1 mark)\n\n27. **(Choose ONE - 5 Marks)**\n\n    **(a) Corrected Sentences:**\n    i)  The dog barks loudly. (Or: The dogs bark loudly.) (1 mark)\n    ii) She went to school yesterday. (1 mark)\n    iii) He is taller than me. (1 mark)\n    iv) They are playing football. (1 mark)\n    v)  I saw him last week. (1 mark)\n\n    **(b) Paragraph on Favourite Game:** (Example answer for assessment)\n    My favourite game is cricket. (Noun: cricket) I play it with my friends in the park. (Verb: play, Noun: friends, park) It is a very exciting game. (Adjective: exciting) We bat and bowl really well. (Verb: bat, bowl, Adverb: really) I love scoring runs. (Verb: scoring, Noun: runs)\n    (Award marks based on sentence structure, relevant vocabulary, and correct use of at least 3 different word types. 5 marks total.)\n\n28. **(Choose ONE - 5 Marks)**\n\n    **(a) Fill in the blanks and identify Part of Speech:**\n    i)  The cat slept **on** the mat. (Part of Speech: Preposition - 1 mark for blank, 1 mark for identification)\n    ii) My friend is very **kind**. (Adjective - 1 mark for blank, 1 mark for identification)\n    iii) The children shouted **loudly**. (Adverb - 1 mark for blank, 1 mark for identification)\n    iv) She likes to read **or** play. (Conjunction - 1 mark for blank, 1 mark for identification)\n    v)  **Wow**! That was a great shot! (Interjection - 1 mark for blank, 1 mark for identification)\n    *(Note: For each blank and identification, award marks appropriately based on the chosen word and its correct classification. If a student fills the blank correctly but misidentifies the part of speech, partial credit can be given.)*\n\n    **(b) Definitions and Examples:**\n    i)  **Adjective:** A word that describes a noun or pronoun. Example: *beautiful, happy, big* (1 mark definition, 1 mark example)\n    ii) **Verb:** A word that shows action or a state of being. Example: *run, eat, is, was* (1 mark definition, 1 mark example)\n    iii) **Conjunction:** A word that joins words, phrases, or sentences. Example: *and, but, or* (1 mark definition, 1 mark example)	2592	gemini-2.5-flash-lite	question_paper	6	2026-07-04 05:32:17.58+00	2026-07-04 05:32:17.58+00
2	13	hi	Hi there! How can I help you today? 😊	46	gemini-2.5-flash-lite	chat	6	2026-07-04 07:12:11.961+00	2026-07-04 07:12:11.961+00
3	13	can you explain me 5+5 in tamil	Sure! In Tamil, we say "Ainthum ainthum paththu".\n\n"Ainthu" (ஐந்து) means five.\n"Paththu" (பத்து) means ten.\n\nSo, "Ainthum ainthum paththu" literally means "five and five are ten".	108	gemini-2.5-flash-lite	chat	6	2026-07-04 07:13:00.949+00	2026-07-04 07:13:00.949+00
4	13	can you explain me gravity in tamil	நிச்சயமாக, நான் புவியீர்ப்பு விசையை தமிழில் உங்களுக்கு எளிமையாக விளக்குகிறேன்!\n\n**புவியீர்ப்பு விசை (Gravity)** என்பது ஒரு சக்தி. இது இரண்டு பொருட்கள் ஒன்றை ஒன்று ஈர்க்கும் சக்தி.\n\n*   **பூமி நம்மை ஈர்க்கிறது:** பூமி ஒரு பெரிய பொருள், அதனால் அது நம்மை தன்னை நோக்கி ஈர்க்கிறது. இதனால்தான் நாம் தரையில் நிற்கிறோம், மேலே பறந்து போவதில்லை.\n*   **பொருட்களும் ஈர்க்கும்:** நாம் அனைவரும், மேஜை, நாற்காலி, புத்தகங்கள் என எல்லாமே சிறிய அளவில் ஒன்றை ஒன்று ஈர்க்கும். ஆனால், பூமி மிகவும் பெரியதாக இருப்பதால், அதன் ஈர்ப்பு விசைதான் நமக்கு அதிகமாகத் தெரிகிறது.\n\n**எப்படி வேலை செய்கிறது?**\n\n*   **பொருளின் அளவு:** ஒரு பொருள் எவ்வளவு பெரியதோ (அதாவது, அதன் நிறை - mass - அதிகமாக இருக்கிறதோ), அவ்வளவு அதிகமாக அதன் புவியீர்ப்பு விசை இருக்கும். அதனால்தான் பெரிய கிரகங்கள் (பூமி, சந்திரன், சூரியன்) சிறிய பொருட்களை விட அதிகமாக ஈர்க்கின்றன.\n*   **தூரம்:** இரண்டு பொருட்களுக்கு இடையே தூரம் அதிகமாக அதிகமாக, அவற்றின் ஈர்ப்பு விசை குறையும். தூரம் குறையும்போது, ஈர்ப்பு விசை அதிகமாகும்.\n\n**சில உதாரணங்கள்:**\n\n*   நீங்கள் ஒரு பந்தை மேலே எறிந்தால், அது மீண்டும் கீழே வருகிறது அல்லவா? அது புவியீர்ப்பு விசையால்தான்.\n*   சந்திரன் பூமியைச் சுற்றி வருகிறது. இதுவும் புவியீர்ப்பு விசையால்தான்.\n*   சூரியன் நம்முடைய சூரிய குடும்பத்தில் உள்ள அனைத்து கிரகங்களையும் தன் பக்கம் ஈர்த்து, அவை சூரியனைச் சுற்றி வர வைக்கிறது.\n\nசுருக்கமாகச் சொன்னால், **புவியீர்ப்பு விசை என்பது பொருட்களை ஒன்றை ஒன்று ஈர்க்கும் ஒரு கண்ணுக்குத் தெரியாத சக்தி**. இது நாம் தரையில் நிற்கவும், கிரகங்கள் சுற்றுப்பாதையில் செல்லவும் உதவுகிறது.\n\nஉங்களுக்கு இது புரிந்ததா? வேறு ஏதேனும் கேள்விகள் இருந்தால் கேளுங்கள்!	452	gemini-2.5-flash-lite	chat	6	2026-07-04 08:16:33.746+00	2026-07-04 08:16:33.746+00
\.


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.attendances (id, school_id, teacher_class_session_id, class_id, section_id, student_id, date, status, marked_by, created_at, updated_at, created_by, updated_by) FROM stdin;
1	1	1	1	1	10	2026-07-04	present	3	2026-07-04 05:28:56.028+00	2026-07-04 05:28:56.028+00	\N	\N
2	1	1	1	1	9	2026-07-04	present	3	2026-07-04 05:28:56.405+00	2026-07-04 05:28:56.405+00	\N	\N
3	1	1	1	1	8	2026-07-04	present	3	2026-07-04 05:28:56.779+00	2026-07-04 05:28:56.779+00	\N	\N
4	1	1	1	1	7	2026-07-04	present	3	2026-07-04 05:28:57.153+00	2026-07-04 05:28:57.153+00	\N	\N
5	1	1	1	1	6	2026-07-04	present	3	2026-07-04 05:28:57.526+00	2026-07-04 05:28:57.526+00	\N	\N
6	1	1	1	1	5	2026-07-04	present	3	2026-07-04 05:28:57.9+00	2026-07-04 05:28:57.9+00	\N	\N
7	1	1	1	1	4	2026-07-04	present	3	2026-07-04 05:28:58.274+00	2026-07-04 05:28:58.274+00	\N	\N
8	1	1	1	1	3	2026-07-04	present	3	2026-07-04 05:28:58.647+00	2026-07-04 05:28:58.647+00	\N	\N
9	1	1	1	1	2	2026-07-04	present	3	2026-07-04 05:28:59.021+00	2026-07-04 05:28:59.021+00	\N	\N
10	1	1	1	1	1	2026-07-04	present	3	2026-07-04 05:28:59.394+00	2026-07-04 05:28:59.394+00	\N	\N
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.audit_logs (id, entity_type, entity_id, action, remark, performed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.classes (id, school_id, class_name, class_teacher_id, is_active, created_at, updated_at) FROM stdin;
1	1	6	\N	t	2026-07-04 05:04:13.294+00	2026-07-04 05:04:13.294+00
2	1	7	\N	t	2026-07-04 05:04:22.59+00	2026-07-04 05:04:22.59+00
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.drivers (id, user_id, school_id, license_number, is_active, created_at, updated_at) FROM stdin;
1	53	1	DL-12345	t	2026-07-04 05:13:36.289+00	2026-07-04 05:13:36.289+00
\.


--
-- Data for Name: exam_masters; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.exam_masters (id, school_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: exam_subjects; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.exam_subjects (id, exam_id, subject_id, syllabus, exam_date, created_at, updated_at) FROM stdin;
2	1	3	chap1	2026-07-30	2026-07-04 05:19:03.641+00	2026-07-04 05:19:03.641+00
1	2	3	chap1	2026-07-04	2026-07-04 05:18:39.399+00	2026-07-04 05:59:16.288+00
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.exams (id, school_id, class_id, name, exam_master_id, is_locked, created_at, updated_at) FROM stdin;
1	1	1	class test	\N	f	2026-07-04 05:17:50.921+00	2026-07-04 05:17:50.921+00
2	1	1	midterm	\N	f	2026-07-04 05:18:11.296+00	2026-07-04 05:18:11.296+00
\.


--
-- Data for Name: families; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.families (id, school_id, father_name, mother_name, guardian_phone, address, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: game_session_players; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.game_session_players (id, session_id, user_id, socket_id, is_host, current_question_index, status, score, joined_at, left_at, finished_at, created_at, updated_at) FROM stdin;
1	1	13	\N	t	0	FINISHED	3	2026-07-04 06:03:57.182+00	\N	2026-07-04 06:04:20.085+00	2026-07-04 06:03:57.182+00	2026-07-04 06:04:20.085+00
\.


--
-- Data for Name: game_sessions; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.game_sessions (id, quiz_id, mode, room_code, host_user_id, max_players, total_time_ms, status, started_at, ended_at, created_at, updated_at) FROM stdin;
1	1	SINGLE	\N	13	\N	300000	FINISHED	2026-07-04 06:03:56.996+00	2026-07-04 06:04:20.27+00	2026-07-04 06:03:56.996+00	2026-07-04 06:04:20.27+00
\.


--
-- Data for Name: group_chat_members; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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
-- Data for Name: group_chat_messages; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.group_chat_messages (id, group_chat_id, sender_user_id, message_type, message_text, image_url, deleted_at, created_at, updated_at) FROM stdin;
1	1	3	text	hi	\N	\N	2026-07-04 05:29:45.048+00	2026-07-04 05:29:45.048+00
2	1	13	text	hi	\N	\N	2026-07-04 06:05:10.467+00	2026-07-04 06:05:10.467+00
\.


--
-- Data for Name: group_chats; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.group_chats (id, teacher_id, subject_id, class_id, section_id, is_active, created_at, updated_at) FROM stdin;
1	3	3	1	1	t	2026-07-04 05:29:37.415+00	2026-07-04 05:29:37.415+00
\.


--
-- Data for Name: homework_submissions; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.homework_submissions (id, homework_id, student_id, is_completed, remark, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: homeworks; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.homeworks (id, school_id, class_id, section_id, teacher_assignment_id, subject_id, homework_date, description, created_by, created_at, updated_at) FROM stdin;
1	1	1	1	2	3	2026-07-05	Finish grammar	3	2026-07-04 05:30:29.38+00	2026-07-04 05:30:29.38+00
\.


--
-- Data for Name: notification_acks; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.notification_acks (id, notification_id, user_id, user_role, acknowledged_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.notifications (id, school_id, sender_user_id, sender_role, title, message, target_role, class_id, section_id, is_active, created_at, updated_at) FROM stdin;
1	1	2	school_admin	parents teachers meeting	parents teachers meeting will be conducted on 20-8-26	all	\N	\N	t	2026-07-04 05:17:27.816+00	2026-07-04 05:17:27.816+00
2	1	2	teacher	Report Card Published	Report card for Priya (midterm) has been published.	student	1	1	t	2026-07-04 05:19:30.594+00	2026-07-04 05:19:30.594+00
3	1	2	teacher	Report Card Published	Report card for Priya (class test) has been published.	student	1	1	t	2026-07-04 05:19:49.989+00	2026-07-04 05:19:49.989+00
4	1	3	teacher	New Homework Assigned	New homework has been assigned for english. Please check.	all	1	1	t	2026-07-04 05:30:29.566+00	2026-07-04 05:30:29.566+00
\.


--
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.parents (id, user_id, student_id, approval_status, approved_by, approved_at, relation_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: player_answers; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.player_answers (id, session_player_id, question_id, selected_option_index, is_correct, time_taken_ms, answered_at, created_at, updated_at) FROM stdin;
1	1	1	0	t	\N	2026-07-04 06:04:18.432+00	2026-07-04 06:04:18.432+00	2026-07-04 06:04:18.432+00
2	1	2	0	f	\N	2026-07-04 06:04:18.8+00	2026-07-04 06:04:18.8+00	2026-07-04 06:04:18.8+00
3	1	3	0	f	\N	2026-07-04 06:04:19.166+00	2026-07-04 06:04:19.166+00	2026-07-04 06:04:19.166+00
4	1	4	3	t	\N	2026-07-04 06:04:19.531+00	2026-07-04 06:04:19.531+00	2026-07-04 06:04:19.531+00
5	1	5	2	t	\N	2026-07-04 06:04:19.901+00	2026-07-04 06:04:19.901+00	2026-07-04 06:04:19.901+00
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.quiz_questions (id, quiz_id, order_index, question_text, options, correct_option_index, created_at, updated_at) FROM stdin;
1	1	0	Which planet is known as the "Red Planet" due to its rusty appearance?	["Mars", "Jupiter", "Venus", "Saturn"]	0	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
2	1	1	What is the largest planet in our solar system?	["Earth", "Saturn", "Jupiter", "Neptune"]	2	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
3	1	2	Which planet is closest to the Sun?	["Venus", "Mercury", "Earth", "Mars"]	1	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
4	1	3	What is the name of the force that keeps the planets orbiting the Sun?	["Magnetism", "Electricity", "Friction", "Gravity"]	3	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
5	1	4	Which planet is famous for its prominent rings, made mostly of ice particles and dust?	["Uranus", "Jupiter", "Saturn", "Neptune"]	2	2026-07-04 06:03:54.589+00	2026-07-04 06:03:54.589+00
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.quizzes (id, owner_user_id, topic, title, difficulty, num_questions, created_at, updated_at) FROM stdin;
1	13	solar system	Solar System Quiz - Class 5	MEDIUM	5	2026-07-04 06:03:54.402+00	2026-07-04 06:03:54.402+00
\.


--
-- Data for Name: report_card_marks; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.report_card_marks (id, report_card_id, subject_id, marks_obtained, max_marks, created_at, updated_at) FROM stdin;
1	1	3	10	100	2026-07-04 05:19:25.882+00	2026-07-04 05:19:25.882+00
2	2	3	80	100	2026-07-04 05:19:45.338+00	2026-07-04 05:19:45.338+00
\.


--
-- Data for Name: report_cards; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.report_cards (id, student_id, class_id, exam_id, school_id, remarks, published_at, created_at, updated_at) FROM stdin;
1	1	1	2	1		2026-07-04 05:19:30.41+00	2026-07-04 05:19:18.848+00	2026-07-04 05:19:30.41+00
2	1	1	1	1		2026-07-04 05:19:49.805+00	2026-07-04 05:19:38.148+00	2026-07-04 05:19:49.805+00
3	2	1	2	1	\N	\N	2026-07-05 14:48:34.526+00	2026-07-05 14:48:34.526+00
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.schools (id, school_name, school_code, cbse_affiliation_no, address, city, state, zip, contact_phone, logo_url, email, status, created_at, updated_at) FROM stdin;
1	bharathi	1	\N	\N	\N	\N	\N	\N	\N	\N	active	2026-07-04 03:34:34.788+00	2026-07-04 03:34:34.788+00
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.sections (id, school_id, class_id, class_teacher_id, name, is_active, created_at, updated_at) FROM stdin;
1	1	1	\N	A	t	2026-07-04 05:04:13.847+00	2026-07-04 05:04:13.847+00
2	1	1	\N	B	t	2026-07-04 05:04:18.221+00	2026-07-04 05:04:18.221+00
3	1	2	\N	A	t	2026-07-04 05:04:23.135+00	2026-07-04 05:04:23.135+00
4	1	2	\N	B	t	2026-07-04 05:04:27.501+00	2026-07-04 05:04:27.501+00
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: student_transports; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.student_transports (student_id, school_id, vehicle_id, pickup_point, is_active, created_at, updated_at) FROM stdin;
1	1	1	vijaymanagalam	t	2026-07-04 05:14:21.825+00	2026-07-04 05:14:21.825+00
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.students (id, user_id, school_id, class_id, section_id, roll_no, admission_no, dob, gender, father_name, mother_name, guardian_name, address, blood_group, aadhar_no, father_occupation, mother_occupation, family_income, guardian_occupation, emergency_contact, residential_status, is_active, approval_status, approved_by, rejection_reason, approved_at, created_at, updated_at, family_id) FROM stdin;
2	14	1	1	1	\N	ADM-S00002	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:14.761+00	2026-07-04 05:04:14.761+00	\N
3	15	1	1	1	\N	ADM-S00003	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:15.125+00	2026-07-04 05:04:15.125+00	\N
4	16	1	1	1	\N	ADM-S00004	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:15.49+00	2026-07-04 05:04:15.49+00	\N
5	17	1	1	1	\N	ADM-S00005	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:15.854+00	2026-07-04 05:04:15.854+00	\N
6	18	1	1	1	\N	ADM-S00006	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:16.218+00	2026-07-04 05:04:16.218+00	\N
7	19	1	1	1	\N	ADM-S00007	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:16.582+00	2026-07-04 05:04:16.582+00	\N
8	20	1	1	1	\N	ADM-S00008	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:16.947+00	2026-07-04 05:04:16.947+00	\N
9	21	1	1	1	\N	ADM-S00009	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:17.311+00	2026-07-04 05:04:17.311+00	\N
10	22	1	1	1	\N	ADM-S00010	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:17.676+00	2026-07-04 05:04:17.676+00	\N
11	23	1	1	2	\N	ADM-S00021	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:18.766+00	2026-07-04 05:04:18.766+00	\N
12	24	1	1	2	\N	ADM-S00022	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:19.131+00	2026-07-04 05:04:19.131+00	\N
13	25	1	1	2	\N	ADM-S00023	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:19.495+00	2026-07-04 05:04:19.495+00	\N
14	26	1	1	2	\N	ADM-S00024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:19.859+00	2026-07-04 05:04:19.859+00	\N
15	27	1	1	2	\N	ADM-S00025	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:20.223+00	2026-07-04 05:04:20.223+00	\N
16	28	1	1	2	\N	ADM-S00026	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:20.587+00	2026-07-04 05:04:20.587+00	\N
17	29	1	1	2	\N	ADM-S00027	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:20.951+00	2026-07-04 05:04:20.951+00	\N
18	30	1	1	2	\N	ADM-S00028	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:21.315+00	2026-07-04 05:04:21.315+00	\N
19	31	1	1	2	\N	ADM-S00029	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:21.68+00	2026-07-04 05:04:21.68+00	\N
20	32	1	1	2	\N	ADM-S00030	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:22.044+00	2026-07-04 05:04:22.044+00	\N
21	33	1	2	3	\N	ADM-S00041	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:23.681+00	2026-07-04 05:04:23.681+00	\N
22	34	1	2	3	\N	ADM-S00042	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:24.045+00	2026-07-04 05:04:24.045+00	\N
23	35	1	2	3	\N	ADM-S00043	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:24.409+00	2026-07-04 05:04:24.409+00	\N
24	36	1	2	3	\N	ADM-S00044	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:24.773+00	2026-07-04 05:04:24.773+00	\N
25	37	1	2	3	\N	ADM-S00045	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:25.137+00	2026-07-04 05:04:25.137+00	\N
26	38	1	2	3	\N	ADM-S00046	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:25.501+00	2026-07-04 05:04:25.501+00	\N
27	39	1	2	3	\N	ADM-S00047	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:25.865+00	2026-07-04 05:04:25.865+00	\N
28	40	1	2	3	\N	ADM-S00048	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:26.228+00	2026-07-04 05:04:26.228+00	\N
29	41	1	2	3	\N	ADM-S00049	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:26.592+00	2026-07-04 05:04:26.592+00	\N
30	42	1	2	3	\N	ADM-S00050	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:26.956+00	2026-07-04 05:04:26.956+00	\N
31	43	1	2	4	\N	ADM-S00061	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:28.048+00	2026-07-04 05:04:28.048+00	\N
32	44	1	2	4	\N	ADM-S00062	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:28.412+00	2026-07-04 05:04:28.412+00	\N
33	45	1	2	4	\N	ADM-S00063	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:28.776+00	2026-07-04 05:04:28.776+00	\N
34	46	1	2	4	\N	ADM-S00064	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:29.14+00	2026-07-04 05:04:29.14+00	\N
35	47	1	2	4	\N	ADM-S00065	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:29.504+00	2026-07-04 05:04:29.504+00	\N
36	48	1	2	4	\N	ADM-S00066	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:29.868+00	2026-07-04 05:04:29.868+00	\N
37	49	1	2	4	\N	ADM-S00067	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:30.232+00	2026-07-04 05:04:30.232+00	\N
38	50	1	2	4	\N	ADM-S00068	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:30.595+00	2026-07-04 05:04:30.595+00	\N
39	51	1	2	4	\N	ADM-S00069	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:30.959+00	2026-07-04 05:04:30.959+00	\N
40	52	1	2	4	\N	ADM-S00070	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dayscholar	t	pending	\N	\N	\N	2026-07-04 05:04:31.323+00	2026-07-04 05:04:31.323+00	\N
1	13	1	1	1	\N	ADM-S00001	2010-07-04	female	ravi	lavanya		test address	A	\N			\N		9898887771	dayscholar	t	approved	2	\N	2026-07-04 05:12:23.558+00	2026-07-04 05:04:14.396+00	2026-07-04 05:12:23.558+00	\N
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.subjects (id, school_id, name, code, category, created_at, updated_at) FROM stdin;
1	1	maths	\N	theory	2026-07-04 05:05:26.373+00	2026-07-04 05:05:26.373+00
2	1	tamil	\N	theory	2026-07-04 05:05:30.933+00	2026-07-04 05:05:30.933+00
3	1	english	\N	theory	2026-07-04 05:05:36.278+00	2026-07-04 05:05:36.278+00
4	1	science	\N	theory	2026-07-04 05:05:41.158+00	2026-07-04 05:05:41.158+00
5	1	social science	\N	theory	2026-07-04 05:05:47+00	2026-07-04 05:05:47+00
\.


--
-- Data for Name: teacher_assignments; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.teacher_assignments (id, school_id, teacher_id, class_id, section_id, subject_id, is_active, is_class_teacher, created_at, updated_at) FROM stdin;
1	1	1	1	1	\N	t	t	2026-07-04 05:14:53.495+00	2026-07-04 05:14:53.495+00
2	1	1	1	1	3	t	f	2026-07-04 05:14:58.6+00	2026-07-04 05:14:58.6+00
\.


--
-- Data for Name: teacher_class_sessions; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.teacher_class_sessions (id, school_id, teacher_assignment_id, teacher_id, class_id, section_id, timetable_id, started_at, ended_at, created_at, updated_at) FROM stdin;
1	1	2	1	1	1	6	2026-07-04 05:28:42.746+00	2026-07-04 05:29:03.861+00	2026-07-04 05:28:42.746+00	2026-07-04 05:29:03.861+00
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.teachers (id, user_id, school_id, employee_id, gender, designation, qualification, joining_date, experience, approval_status, is_active, approved_by, rejection_reason, approved_at, created_at, updated_at) FROM stdin;
2	4	1	EMP-T00002	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:09.833+00	2026-07-04 05:04:09.833+00
3	5	1	EMP-T00003	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:10.198+00	2026-07-04 05:04:10.198+00
4	6	1	EMP-T00004	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:10.562+00	2026-07-04 05:04:10.562+00
5	7	1	EMP-T00005	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:10.926+00	2026-07-04 05:04:10.926+00
6	8	1	EMP-T00006	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:11.29+00	2026-07-04 05:04:11.29+00
7	9	1	EMP-T00007	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:11.655+00	2026-07-04 05:04:11.655+00
8	10	1	EMP-T00008	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:12.019+00	2026-07-04 05:04:12.019+00
9	11	1	EMP-T00009	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:12.383+00	2026-07-04 05:04:12.383+00
10	12	1	EMP-T00010	\N	\N	\N	2026-07-04	\N	pending	t	\N	\N	\N	2026-07-04 05:04:12.747+00	2026-07-04 05:04:12.747+00
1	3	1	EMP-T00001	male	Teacher	BA	2026-07-04	2	approved	t	2	\N	2026-07-04 05:08:28.526+00	2026-07-04 05:04:09.466+00	2026-07-04 05:08:28.526+00
\.


--
-- Data for Name: timetables; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.timetables (id, school_id, class_id, section_id, day_of_week, start_time, end_time, teacher_assignment_id, title, is_break, created_at, updated_at) FROM stdin;
1	1	1	1	monday	18:00:00	18:45:00	2	\N	f	2026-07-04 05:15:29.566+00	2026-07-04 05:15:29.566+00
2	1	1	1	tuesday	18:00:00	18:45:00	2	\N	f	2026-07-04 05:15:45.988+00	2026-07-04 05:15:45.988+00
3	1	1	1	wednesday	18:00:00	18:45:00	2	\N	f	2026-07-04 05:15:58.657+00	2026-07-04 05:15:58.657+00
4	1	1	1	thursday	18:00:00	18:45:00	2	\N	f	2026-07-04 05:16:13.079+00	2026-07-04 05:16:13.079+00
5	1	1	1	friday	18:00:00	18:45:00	2	\N	f	2026-07-04 05:16:25.356+00	2026-07-04 05:16:25.356+00
6	1	1	1	saturday	18:00:00	18:45:00	2	\N	f	2026-07-04 05:16:40.491+00	2026-07-04 05:16:40.491+00
\.


--
-- Data for Name: token_accounts; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.token_accounts (id, user_id, balance, expires_at, created_at, updated_at) FROM stdin;
1	3	97407	\N	2026-07-04 05:09:13.981+00	2026-07-04 05:32:19.516+00
2	13	99393	\N	2026-07-04 05:12:38.066+00	2026-07-04 08:16:34.778+00
\.


--
-- Data for Name: token_policies; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.token_policies (id, role, monthly_tokens, updated_by, created_at, updated_at) FROM stdin;
1	student	99999	1	2026-07-04 04:56:07.554+00	2026-07-04 04:59:00.65+00
3	teacher	99999	1	2026-07-04 04:56:07.925+00	2026-07-04 04:59:01.018+00
\.


--
-- Data for Name: token_transactions; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.token_transactions (id, user_id, type, change, balance_before, balance_after, created_at, updated_at) FROM stdin;
1	3	admin_adjustment	99999	0	99999	2026-07-04 05:09:14.161+00	2026-07-04 05:09:14.161+00
2	13	admin_adjustment	99999	0	99999	2026-07-04 05:12:38.25+00	2026-07-04 05:12:38.25+00
3	3	usage	-2592	99999	97407	2026-07-04 05:32:19.699+00	2026-07-04 05:32:19.699+00
4	13	usage	-46	99999	99953	2026-07-04 07:12:13.383+00	2026-07-04 07:12:13.383+00
5	13	usage	-108	99953	99845	2026-07-04 07:13:02.052+00	2026-07-04 07:13:02.052+00
6	13	usage	-452	99845	99393	2026-07-04 08:16:34.967+00	2026-07-04 08:16:34.967+00
\.


--
-- Data for Name: transport_requests; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.transport_requests (id, school_id, student_id, current_vehicle_id, requested_vehicle_id, pickup_point, status, approved_by, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: trip_locations; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.trips (id, school_id, driver_id, vehicle_id, trip_type, status, started_at, ended_at, created_at, updated_at) FROM stdin;
1	1	1	1	drop	completed	2026-07-04 05:23:02.193+00	2026-07-04 05:26:05.155+00	2026-07-04 05:23:02.193+00	2026-07-04 05:26:05.155+00
2	1	1	1	pickup	completed	2026-07-05 14:45:03.889+00	2026-07-05 14:45:50.488+00	2026-07-05 14:45:03.89+00	2026-07-05 14:45:50.488+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
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
53	1	driver	\N	9234567890	driver123	f	driver	Murugan	t	\N	\N	\N	2026-07-04 05:13:36.109+00	2026-07-04 05:13:36.109+00
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.vehicles (id, school_id, vehicle_number, vehicle_name, capacity, driver_id, is_active, created_at, updated_at) FROM stdin;
1	1	TN12345	BUS 1	50	1	t	2026-07-04 05:13:55.982+00	2026-07-04 05:13:55.982+00
\.


--
-- Data for Name: voice_logs; Type: TABLE DATA; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

COPY public.voice_logs (id, user_id, purpose, text, tokens_used, created_at, updated_at) FROM stdin;
\.


--
-- Name: ai_chat_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.ai_chat_logs_id_seq', 4, true);


--
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.attendances_id_seq', 10, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.classes_id_seq', 2, true);


--
-- Name: drivers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.drivers_id_seq', 1, true);


--
-- Name: exam_masters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.exam_masters_id_seq', 1, false);


--
-- Name: exam_subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.exam_subjects_id_seq', 3, true);


--
-- Name: exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.exams_id_seq', 2, true);


--
-- Name: families_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.families_id_seq', 1, false);


--
-- Name: game_session_players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.game_session_players_id_seq', 1, true);


--
-- Name: game_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.game_sessions_id_seq', 1, true);


--
-- Name: group_chat_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.group_chat_members_id_seq', 11, true);


--
-- Name: group_chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.group_chat_messages_id_seq', 2, true);


--
-- Name: group_chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.group_chats_id_seq', 1, true);


--
-- Name: homework_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.homework_submissions_id_seq', 1, false);


--
-- Name: homeworks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.homeworks_id_seq', 1, true);


--
-- Name: notification_acks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.notification_acks_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.notifications_id_seq', 4, true);


--
-- Name: parents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.parents_id_seq', 1, false);


--
-- Name: player_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.player_answers_id_seq', 5, true);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.quiz_questions_id_seq', 5, true);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.quizzes_id_seq', 1, true);


--
-- Name: report_card_marks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.report_card_marks_id_seq', 2, true);


--
-- Name: report_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.report_cards_id_seq', 3, true);


--
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.schools_id_seq', 1, true);


--
-- Name: sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.sections_id_seq', 4, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.students_id_seq', 40, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.subjects_id_seq', 5, true);


--
-- Name: teacher_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.teacher_assignments_id_seq', 2, true);


--
-- Name: teacher_class_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.teacher_class_sessions_id_seq', 1, true);


--
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.teachers_id_seq', 10, true);


--
-- Name: timetables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.timetables_id_seq', 6, true);


--
-- Name: token_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.token_accounts_id_seq', 2, true);


--
-- Name: token_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.token_policies_id_seq', 10, true);


--
-- Name: token_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.token_transactions_id_seq', 6, true);


--
-- Name: transport_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.transport_requests_id_seq', 1, false);


--
-- Name: trip_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.trip_locations_id_seq', 9, true);


--
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.trips_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.users_id_seq', 53, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 1, true);


--
-- Name: voice_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

SELECT pg_catalog.setval('public.voice_logs_id_seq', 1, false);


--
-- Name: ai_chat_logs ai_chat_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.ai_chat_logs
    ADD CONSTRAINT ai_chat_logs_pkey PRIMARY KEY (id);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_key UNIQUE (user_id);


--
-- Name: exam_masters exam_masters_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exam_masters
    ADD CONSTRAINT exam_masters_pkey PRIMARY KEY (id);


--
-- Name: exam_subjects exam_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exam_subjects
    ADD CONSTRAINT exam_subjects_pkey PRIMARY KEY (id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: families families_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT families_pkey PRIMARY KEY (id);


--
-- Name: game_session_players game_session_players_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.game_session_players
    ADD CONSTRAINT game_session_players_pkey PRIMARY KEY (id);


--
-- Name: game_sessions game_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_pkey PRIMARY KEY (id);


--
-- Name: game_sessions game_sessions_room_code_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_room_code_key UNIQUE (room_code);


--
-- Name: group_chat_members group_chat_members_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chat_members
    ADD CONSTRAINT group_chat_members_pkey PRIMARY KEY (id);


--
-- Name: group_chat_messages group_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chat_messages
    ADD CONSTRAINT group_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: group_chats group_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_pkey PRIMARY KEY (id);


--
-- Name: homework_submissions homework_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_pkey PRIMARY KEY (id);


--
-- Name: homeworks homeworks_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_pkey PRIMARY KEY (id);


--
-- Name: notification_acks notification_acks_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.notification_acks
    ADD CONSTRAINT notification_acks_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: parents parents_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_pkey PRIMARY KEY (id);


--
-- Name: player_answers player_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.player_answers
    ADD CONSTRAINT player_answers_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: report_card_marks report_card_marks_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_card_marks
    ADD CONSTRAINT report_card_marks_pkey PRIMARY KEY (id);


--
-- Name: report_cards report_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_pkey PRIMARY KEY (id);


--
-- Name: schools schools_email_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_email_key UNIQUE (email);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: schools schools_school_code_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_school_code_key UNIQUE (school_code);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: student_transports student_transports_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.student_transports
    ADD CONSTRAINT student_transports_pkey PRIMARY KEY (student_id);


--
-- Name: students students_aadhar_no_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_aadhar_no_key UNIQUE (aadhar_no);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teacher_assignments teacher_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_pkey PRIMARY KEY (id);


--
-- Name: teacher_class_sessions teacher_class_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id);


--
-- Name: timetables timetables_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);


--
-- Name: token_accounts token_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_accounts
    ADD CONSTRAINT token_accounts_pkey PRIMARY KEY (id);


--
-- Name: token_accounts token_accounts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_accounts
    ADD CONSTRAINT token_accounts_user_id_key UNIQUE (user_id);


--
-- Name: token_policies token_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_policies
    ADD CONSTRAINT token_policies_pkey PRIMARY KEY (id);


--
-- Name: token_transactions token_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_transactions
    ADD CONSTRAINT token_transactions_pkey PRIMARY KEY (id);


--
-- Name: transport_requests transport_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_pkey PRIMARY KEY (id);


--
-- Name: trip_locations trip_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.trip_locations
    ADD CONSTRAINT trip_locations_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: voice_logs voice_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.voice_logs
    ADD CONSTRAINT voice_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_chat_logs_ai_type; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX ai_chat_logs_ai_type ON public.ai_chat_logs USING btree (ai_type);


--
-- Name: ai_chat_logs_created_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX ai_chat_logs_created_at ON public.ai_chat_logs USING btree (created_at);


--
-- Name: ai_chat_logs_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX ai_chat_logs_user_id ON public.ai_chat_logs USING btree (user_id);


--
-- Name: attendances_class_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX attendances_class_id ON public.attendances USING btree (class_id);


--
-- Name: attendances_date; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX attendances_date ON public.attendances USING btree (date);


--
-- Name: attendances_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX attendances_school_id ON public.attendances USING btree (school_id);


--
-- Name: attendances_section_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX attendances_section_id ON public.attendances USING btree (section_id);


--
-- Name: attendances_student_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX attendances_student_id ON public.attendances USING btree (student_id);


--
-- Name: attendances_student_id_date; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX attendances_student_id_date ON public.attendances USING btree (student_id, date);


--
-- Name: attendances_student_id_teacher_class_session_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX attendances_student_id_teacher_class_session_id ON public.attendances USING btree (student_id, teacher_class_session_id);


--
-- Name: attendances_teacher_class_session_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX attendances_teacher_class_session_id ON public.attendances USING btree (teacher_class_session_id);


--
-- Name: audit_logs_entity_type_entity_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX audit_logs_entity_type_entity_id ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: audit_logs_performed_by; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX audit_logs_performed_by ON public.audit_logs USING btree (performed_by);


--
-- Name: classes_school_id_class_name; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX classes_school_id_class_name ON public.classes USING btree (school_id, class_name);


--
-- Name: drivers_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX drivers_school_id ON public.drivers USING btree (school_id);


--
-- Name: drivers_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX drivers_user_id ON public.drivers USING btree (user_id);


--
-- Name: exam_masters_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX exam_masters_school_id ON public.exam_masters USING btree (school_id);


--
-- Name: exam_masters_school_id_name; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX exam_masters_school_id_name ON public.exam_masters USING btree (school_id, name);


--
-- Name: exam_subjects_exam_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX exam_subjects_exam_id ON public.exam_subjects USING btree (exam_id);


--
-- Name: exam_subjects_exam_id_subject_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX exam_subjects_exam_id_subject_id ON public.exam_subjects USING btree (exam_id, subject_id);


--
-- Name: exam_subjects_subject_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX exam_subjects_subject_id ON public.exam_subjects USING btree (subject_id);


--
-- Name: exams_class_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX exams_class_id ON public.exams USING btree (class_id);


--
-- Name: exams_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX exams_school_id ON public.exams USING btree (school_id);


--
-- Name: exams_school_id_class_id_exam_master_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX exams_school_id_class_id_exam_master_id ON public.exams USING btree (school_id, class_id, exam_master_id);


--
-- Name: exams_school_id_class_id_name; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX exams_school_id_class_id_name ON public.exams USING btree (school_id, class_id, name);


--
-- Name: families_guardian_phone; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX families_guardian_phone ON public.families USING btree (guardian_phone);


--
-- Name: families_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX families_school_id ON public.families USING btree (school_id);


--
-- Name: game_session_players_session_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX game_session_players_session_id ON public.game_session_players USING btree (session_id);


--
-- Name: game_session_players_session_id_score_finished_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX game_session_players_session_id_score_finished_at ON public.game_session_players USING btree (session_id, score, finished_at);


--
-- Name: game_session_players_session_id_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX game_session_players_session_id_user_id ON public.game_session_players USING btree (session_id, user_id);


--
-- Name: game_session_players_status; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX game_session_players_status ON public.game_session_players USING btree (status);


--
-- Name: game_session_players_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX game_session_players_user_id ON public.game_session_players USING btree (user_id);


--
-- Name: game_sessions_host_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX game_sessions_host_user_id ON public.game_sessions USING btree (host_user_id);


--
-- Name: game_sessions_quiz_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX game_sessions_quiz_id ON public.game_sessions USING btree (quiz_id);


--
-- Name: game_sessions_room_code; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX game_sessions_room_code ON public.game_sessions USING btree (room_code);


--
-- Name: game_sessions_status; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX game_sessions_status ON public.game_sessions USING btree (status);


--
-- Name: group_chat_members_group_chat_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chat_members_group_chat_id ON public.group_chat_members USING btree (group_chat_id);


--
-- Name: group_chat_members_role; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chat_members_role ON public.group_chat_members USING btree (role);


--
-- Name: group_chat_members_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chat_members_user_id ON public.group_chat_members USING btree (user_id);


--
-- Name: group_chat_messages_created_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chat_messages_created_at ON public.group_chat_messages USING btree (created_at);


--
-- Name: group_chat_messages_group_chat_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chat_messages_group_chat_id ON public.group_chat_messages USING btree (group_chat_id);


--
-- Name: group_chat_messages_group_chat_id_created_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chat_messages_group_chat_id_created_at ON public.group_chat_messages USING btree (group_chat_id, created_at);


--
-- Name: group_chat_messages_sender_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chat_messages_sender_user_id ON public.group_chat_messages USING btree (sender_user_id);


--
-- Name: group_chats_section_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chats_section_id ON public.group_chats USING btree (section_id);


--
-- Name: group_chats_subject_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chats_subject_id ON public.group_chats USING btree (subject_id);


--
-- Name: group_chats_teacher_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX group_chats_teacher_id ON public.group_chats USING btree (teacher_id);


--
-- Name: homework_submissions_homework_id_student_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX homework_submissions_homework_id_student_id ON public.homework_submissions USING btree (homework_id, student_id);


--
-- Name: homework_submissions_student_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX homework_submissions_student_id ON public.homework_submissions USING btree (student_id);


--
-- Name: homeworks_class_id_section_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX homeworks_class_id_section_id ON public.homeworks USING btree (class_id, section_id);


--
-- Name: homeworks_homework_date; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX homeworks_homework_date ON public.homeworks USING btree (homework_date);


--
-- Name: homeworks_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX homeworks_school_id ON public.homeworks USING btree (school_id);


--
-- Name: homeworks_teacher_assignment_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX homeworks_teacher_assignment_id ON public.homeworks USING btree (teacher_assignment_id);


--
-- Name: notification_acks_notification_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX notification_acks_notification_id ON public.notification_acks USING btree (notification_id);


--
-- Name: notification_acks_notification_id_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX notification_acks_notification_id_user_id ON public.notification_acks USING btree (notification_id, user_id);


--
-- Name: notifications_class_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX notifications_class_id ON public.notifications USING btree (class_id);


--
-- Name: notifications_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX notifications_school_id ON public.notifications USING btree (school_id);


--
-- Name: notifications_target_role; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX notifications_target_role ON public.notifications USING btree (target_role);


--
-- Name: parents_student_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX parents_student_id ON public.parents USING btree (student_id);


--
-- Name: parents_student_id_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX parents_student_id_user_id ON public.parents USING btree (student_id, user_id);


--
-- Name: parents_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX parents_user_id ON public.parents USING btree (user_id);


--
-- Name: player_answers_answered_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX player_answers_answered_at ON public.player_answers USING btree (answered_at);


--
-- Name: player_answers_question_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX player_answers_question_id ON public.player_answers USING btree (question_id);


--
-- Name: player_answers_session_player_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX player_answers_session_player_id ON public.player_answers USING btree (session_player_id);


--
-- Name: quiz_questions_quiz_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX quiz_questions_quiz_id ON public.quiz_questions USING btree (quiz_id);


--
-- Name: quiz_questions_quiz_id_order_index; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX quiz_questions_quiz_id_order_index ON public.quiz_questions USING btree (quiz_id, order_index);


--
-- Name: quizzes_owner_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX quizzes_owner_user_id ON public.quizzes USING btree (owner_user_id);


--
-- Name: quizzes_topic; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX quizzes_topic ON public.quizzes USING btree (topic);


--
-- Name: report_card_marks_report_card_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX report_card_marks_report_card_id ON public.report_card_marks USING btree (report_card_id);


--
-- Name: report_card_marks_subject_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX report_card_marks_subject_id ON public.report_card_marks USING btree (subject_id);


--
-- Name: report_cards_exam_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX report_cards_exam_id ON public.report_cards USING btree (exam_id);


--
-- Name: report_cards_student_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX report_cards_student_id ON public.report_cards USING btree (student_id);


--
-- Name: report_cards_student_id_exam_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX report_cards_student_id_exam_id ON public.report_cards USING btree (student_id, exam_id);


--
-- Name: schools_city; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX schools_city ON public.schools USING btree (city);


--
-- Name: schools_state; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX schools_state ON public.schools USING btree (state);


--
-- Name: schools_status; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX schools_status ON public.schools USING btree (status);


--
-- Name: sections_class_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX sections_class_id ON public.sections USING btree (class_id);


--
-- Name: sections_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX sections_school_id ON public.sections USING btree (school_id);


--
-- Name: sections_school_id_class_id_name; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX sections_school_id_class_id_name ON public.sections USING btree (school_id, class_id, name);


--
-- Name: student_transports_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX student_transports_school_id ON public.student_transports USING btree (school_id);


--
-- Name: student_transports_vehicle_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX student_transports_vehicle_id ON public.student_transports USING btree (vehicle_id);


--
-- Name: students_class_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX students_class_id ON public.students USING btree (class_id);


--
-- Name: students_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX students_school_id ON public.students USING btree (school_id);


--
-- Name: students_school_id_admission_no; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX students_school_id_admission_no ON public.students USING btree (school_id, admission_no);


--
-- Name: students_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX students_user_id ON public.students USING btree (user_id);


--
-- Name: subjects_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX subjects_school_id ON public.subjects USING btree (school_id);


--
-- Name: subjects_school_id_name; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX subjects_school_id_name ON public.subjects USING btree (school_id, name);


--
-- Name: teacher_assignments_class_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teacher_assignments_class_id ON public.teacher_assignments USING btree (class_id);


--
-- Name: teacher_assignments_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teacher_assignments_school_id ON public.teacher_assignments USING btree (school_id);


--
-- Name: teacher_assignments_teacher_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teacher_assignments_teacher_id ON public.teacher_assignments USING btree (teacher_id);


--
-- Name: teacher_assignments_teacher_id_section_id_subject_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX teacher_assignments_teacher_id_section_id_subject_id ON public.teacher_assignments USING btree (teacher_id, section_id, subject_id);


--
-- Name: teacher_class_sessions_class_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teacher_class_sessions_class_id ON public.teacher_class_sessions USING btree (class_id);


--
-- Name: teacher_class_sessions_section_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teacher_class_sessions_section_id ON public.teacher_class_sessions USING btree (section_id);


--
-- Name: teacher_class_sessions_started_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teacher_class_sessions_started_at ON public.teacher_class_sessions USING btree (started_at);


--
-- Name: teacher_class_sessions_teacher_assignment_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teacher_class_sessions_teacher_assignment_id ON public.teacher_class_sessions USING btree (teacher_assignment_id);


--
-- Name: teacher_class_sessions_teacher_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teacher_class_sessions_teacher_id ON public.teacher_class_sessions USING btree (teacher_id);


--
-- Name: teacher_class_sessions_timetable_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teacher_class_sessions_timetable_id ON public.teacher_class_sessions USING btree (timetable_id);


--
-- Name: teachers_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teachers_school_id ON public.teachers USING btree (school_id);


--
-- Name: teachers_school_id_employee_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX teachers_school_id_employee_id ON public.teachers USING btree (school_id, employee_id);


--
-- Name: teachers_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX teachers_user_id ON public.teachers USING btree (user_id);


--
-- Name: timetables_class_id_section_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX timetables_class_id_section_id ON public.timetables USING btree (class_id, section_id);


--
-- Name: timetables_day_of_week; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX timetables_day_of_week ON public.timetables USING btree (day_of_week);


--
-- Name: timetables_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX timetables_school_id ON public.timetables USING btree (school_id);


--
-- Name: timetables_teacher_assignment_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX timetables_teacher_assignment_id ON public.timetables USING btree (teacher_assignment_id);


--
-- Name: token_accounts_expires_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX token_accounts_expires_at ON public.token_accounts USING btree (expires_at);


--
-- Name: token_accounts_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX token_accounts_user_id ON public.token_accounts USING btree (user_id);


--
-- Name: token_policies_role; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX token_policies_role ON public.token_policies USING btree (role);


--
-- Name: token_transactions_created_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX token_transactions_created_at ON public.token_transactions USING btree (created_at);


--
-- Name: token_transactions_type; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX token_transactions_type ON public.token_transactions USING btree (type);


--
-- Name: token_transactions_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX token_transactions_user_id ON public.token_transactions USING btree (user_id);


--
-- Name: transport_requests_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX transport_requests_school_id ON public.transport_requests USING btree (school_id);


--
-- Name: transport_requests_status; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX transport_requests_status ON public.transport_requests USING btree (status);


--
-- Name: transport_requests_student_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX transport_requests_student_id ON public.transport_requests USING btree (student_id);


--
-- Name: trip_locations_created_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX trip_locations_created_at ON public.trip_locations USING btree (created_at);


--
-- Name: trip_locations_trip_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX trip_locations_trip_id ON public.trip_locations USING btree (trip_id);


--
-- Name: trips_driver_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX trips_driver_id ON public.trips USING btree (driver_id);


--
-- Name: trips_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX trips_school_id ON public.trips USING btree (school_id);


--
-- Name: trips_status; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX trips_status ON public.trips USING btree (status);


--
-- Name: trips_vehicle_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX trips_vehicle_id ON public.trips USING btree (vehicle_id);


--
-- Name: uq_group_chat_member; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX uq_group_chat_member ON public.group_chat_members USING btree (group_chat_id, user_id);


--
-- Name: uq_player_answer_session_question; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX uq_player_answer_session_question ON public.player_answers USING btree (session_player_id, question_id);


--
-- Name: uq_teacher_subject_section_chat; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX uq_teacher_subject_section_chat ON public.group_chats USING btree (teacher_id, subject_id, section_id);


--
-- Name: users_phone; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX users_phone ON public.users USING btree (phone);


--
-- Name: users_role; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX users_role ON public.users USING btree (role);


--
-- Name: users_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX users_school_id ON public.users USING btree (school_id);


--
-- Name: users_school_id_username; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX users_school_id_username ON public.users USING btree (school_id, username);


--
-- Name: vehicles_driver_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX vehicles_driver_id ON public.vehicles USING btree (driver_id);


--
-- Name: vehicles_school_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX vehicles_school_id ON public.vehicles USING btree (school_id);


--
-- Name: vehicles_school_id_vehicle_number; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE UNIQUE INDEX vehicles_school_id_vehicle_number ON public.vehicles USING btree (school_id, vehicle_number);


--
-- Name: voice_logs_created_at; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX voice_logs_created_at ON public.voice_logs USING btree (created_at);


--
-- Name: voice_logs_purpose; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX voice_logs_purpose ON public.voice_logs USING btree (purpose);


--
-- Name: voice_logs_user_id; Type: INDEX; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

CREATE INDEX voice_logs_user_id ON public.voice_logs USING btree (user_id);


--
-- Name: ai_chat_logs ai_chat_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.ai_chat_logs
    ADD CONSTRAINT ai_chat_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: attendances attendances_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendances attendances_teacher_class_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_teacher_class_session_id_fkey FOREIGN KEY (teacher_class_session_id) REFERENCES public.teacher_class_sessions(id) ON UPDATE CASCADE;


--
-- Name: attendances attendances_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: classes classes_class_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_class_teacher_id_fkey FOREIGN KEY (class_teacher_id) REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: classes classes_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: drivers drivers_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: drivers drivers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exam_masters exam_masters_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exam_masters
    ADD CONSTRAINT exam_masters_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: exam_subjects exam_subjects_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exam_subjects
    ADD CONSTRAINT exam_subjects_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exam_subjects exam_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exam_subjects
    ADD CONSTRAINT exam_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE;


--
-- Name: exams exams_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE;


--
-- Name: exams exams_exam_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_exam_master_id_fkey FOREIGN KEY (exam_master_id) REFERENCES public.exam_masters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: exams exams_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: families families_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT families_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: game_session_players game_session_players_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.game_session_players
    ADD CONSTRAINT game_session_players_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.game_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: game_session_players game_session_players_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.game_session_players
    ADD CONSTRAINT game_session_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: game_sessions game_sessions_host_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_host_user_id_fkey FOREIGN KEY (host_user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: game_sessions game_sessions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON UPDATE CASCADE;


--
-- Name: group_chat_members group_chat_members_group_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chat_members
    ADD CONSTRAINT group_chat_members_group_chat_id_fkey FOREIGN KEY (group_chat_id) REFERENCES public.group_chats(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_chat_members group_chat_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chat_members
    ADD CONSTRAINT group_chat_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: group_chat_messages group_chat_messages_group_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chat_messages
    ADD CONSTRAINT group_chat_messages_group_chat_id_fkey FOREIGN KEY (group_chat_id) REFERENCES public.group_chats(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_chat_messages group_chat_messages_sender_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chat_messages
    ADD CONSTRAINT group_chat_messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: group_chats group_chats_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE;


--
-- Name: group_chats group_chats_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE;


--
-- Name: group_chats group_chats_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE;


--
-- Name: group_chats group_chats_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: homework_submissions homework_submissions_homework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_homework_id_fkey FOREIGN KEY (homework_id) REFERENCES public.homeworks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homework_submissions homework_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE;


--
-- Name: homeworks homeworks_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homeworks homeworks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homeworks homeworks_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: homeworks homeworks_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homeworks homeworks_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homeworks homeworks_teacher_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_teacher_assignment_id_fkey FOREIGN KEY (teacher_assignment_id) REFERENCES public.teacher_assignments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_acks notification_acks_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.notification_acks
    ADD CONSTRAINT notification_acks_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: notifications notifications_sender_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: player_answers player_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.player_answers
    ADD CONSTRAINT player_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id) ON UPDATE CASCADE;


--
-- Name: player_answers player_answers_session_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.player_answers
    ADD CONSTRAINT player_answers_session_player_id_fkey FOREIGN KEY (session_player_id) REFERENCES public.game_session_players(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quizzes quizzes_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: report_card_marks report_card_marks_report_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_card_marks
    ADD CONSTRAINT report_card_marks_report_card_id_fkey FOREIGN KEY (report_card_id) REFERENCES public.report_cards(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_card_marks report_card_marks_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_card_marks
    ADD CONSTRAINT report_card_marks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE;


--
-- Name: report_cards report_cards_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE;


--
-- Name: report_cards report_cards_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_cards report_cards_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: report_cards report_cards_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE;


--
-- Name: sections sections_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sections sections_class_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_class_teacher_id_fkey FOREIGN KEY (class_teacher_id) REFERENCES public.teachers(id);


--
-- Name: sections sections_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_transports student_transports_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.student_transports
    ADD CONSTRAINT student_transports_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_transports student_transports_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.student_transports
    ADD CONSTRAINT student_transports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_transports student_transports_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.student_transports
    ADD CONSTRAINT student_transports_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: students students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subjects subjects_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_teacher_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_teacher_assignment_id_fkey FOREIGN KEY (teacher_assignment_id) REFERENCES public.teacher_assignments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_class_sessions teacher_class_sessions_timetable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teacher_class_sessions
    ADD CONSTRAINT teacher_class_sessions_timetable_id_fkey FOREIGN KEY (timetable_id) REFERENCES public.timetables(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teachers teachers_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: teachers teachers_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_teacher_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_teacher_assignment_id_fkey FOREIGN KEY (teacher_assignment_id) REFERENCES public.teacher_assignments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: token_accounts token_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_accounts
    ADD CONSTRAINT token_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: token_policies token_policies_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_policies
    ADD CONSTRAINT token_policies_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: token_transactions token_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.token_transactions
    ADD CONSTRAINT token_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transport_requests transport_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: transport_requests transport_requests_current_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_current_vehicle_id_fkey FOREIGN KEY (current_vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_requested_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_requested_vehicle_id_fkey FOREIGN KEY (requested_vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transport_requests transport_requests_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transport_requests transport_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trip_locations trip_locations_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.trip_locations
    ADD CONSTRAINT trip_locations_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trips trips_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trips trips_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trips trips_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vehicles vehicles_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vehicles vehicles_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voice_logs voice_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucpkmvrvwzoqz0wvousr
--

ALTER TABLE ONLY public.voice_logs
    ADD CONSTRAINT voice_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO ucpkmvrvwzoqz0wvousr;


--
-- PostgreSQL database dump complete
--

\unrestrict 6UscsUxUPQgWdZbsO5hWjQKCSilLszLIH8wTfMjxkVqlrsgtvrwTbMz2C0Zue3d

