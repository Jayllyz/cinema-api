-- CreateTable
CREATE TABLE "ROOMS" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "open" BOOLEAN NOT NULL,
    "handicap_access" BOOLEAN NOT NULL,

    CONSTRAINT "ROOMS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "USERS" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "money" INTEGER NOT NULL DEFAULT 0,
    "role" INTEGER NOT NULL DEFAULT 1,
    "token" TEXT,

    CONSTRAINT "USERS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CATEGORIES" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CATEGORIES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MOVIES" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "release_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "MOVIES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CATEGORIES_MOVIES" (
    "category_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,

    CONSTRAINT "CATEGORIES_MOVIES_pkey" PRIMARY KEY ("category_id","movie_id")
);

-- CreateTable
CREATE TABLE "SCREENINGS" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "screening_duration_minutes" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,

    CONSTRAINT "SCREENINGS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EMPLOYEES" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "token" TEXT,
    "role" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "EMPLOYEES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WORKING_SHIFTS" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "position" TEXT NOT NULL,
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "WORKING_SHIFTS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TICKETS" (
    "id" SERIAL NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "seat" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "user_id" INTEGER,
    "screening_id" INTEGER NOT NULL,
    "acquired_at" TIMESTAMP(3),

    CONSTRAINT "TICKETS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SUPER_TICKETS" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "uses" INTEGER NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "SUPER_TICKETS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SUPER_TICKETS_SESSIONS" (
    "used" BOOLEAN NOT NULL DEFAULT false,
    "seat" INTEGER NOT NULL,
    "original_price" INTEGER NOT NULL,
    "super_ticket_id" INTEGER NOT NULL,
    "screening_id" INTEGER NOT NULL,

    CONSTRAINT "SUPER_TICKETS_SESSIONS_pkey" PRIMARY KEY ("super_ticket_id","screening_id")
);

-- CreateTable
CREATE TABLE "IMAGES" (
    "id" SERIAL NOT NULL,
    "alt" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "movieId" INTEGER,
    "roomId" INTEGER,

    CONSTRAINT "IMAGES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoriesToMovies" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ROOMS_name_key" ON "ROOMS"("name");

-- CreateIndex
CREATE UNIQUE INDEX "USERS_email_key" ON "USERS"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CATEGORIES_name_key" ON "CATEGORIES"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MOVIES_title_key" ON "MOVIES"("title");

-- CreateIndex
CREATE UNIQUE INDEX "SCREENINGS_start_time_room_id_key" ON "SCREENINGS"("start_time", "room_id");

-- CreateIndex
CREATE UNIQUE INDEX "EMPLOYEES_email_key" ON "EMPLOYEES"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TICKETS_screening_id_seat_key" ON "TICKETS"("screening_id", "seat");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoriesToMovies_AB_unique" ON "_CategoriesToMovies"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoriesToMovies_B_index" ON "_CategoriesToMovies"("B");

-- AddForeignKey
ALTER TABLE "CATEGORIES_MOVIES" ADD CONSTRAINT "CATEGORIES_MOVIES_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "CATEGORIES"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CATEGORIES_MOVIES" ADD CONSTRAINT "CATEGORIES_MOVIES_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "MOVIES"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SCREENINGS" ADD CONSTRAINT "SCREENINGS_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "MOVIES"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SCREENINGS" ADD CONSTRAINT "SCREENINGS_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "ROOMS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WORKING_SHIFTS" ADD CONSTRAINT "WORKING_SHIFTS_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "EMPLOYEES"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TICKETS" ADD CONSTRAINT "TICKETS_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USERS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TICKETS" ADD CONSTRAINT "TICKETS_screening_id_fkey" FOREIGN KEY ("screening_id") REFERENCES "SCREENINGS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SUPER_TICKETS" ADD CONSTRAINT "SUPER_TICKETS_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USERS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SUPER_TICKETS_SESSIONS" ADD CONSTRAINT "SUPER_TICKETS_SESSIONS_super_ticket_id_fkey" FOREIGN KEY ("super_ticket_id") REFERENCES "SUPER_TICKETS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SUPER_TICKETS_SESSIONS" ADD CONSTRAINT "SUPER_TICKETS_SESSIONS_screening_id_fkey" FOREIGN KEY ("screening_id") REFERENCES "SCREENINGS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IMAGES" ADD CONSTRAINT "IMAGES_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "MOVIES"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IMAGES" ADD CONSTRAINT "IMAGES_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ROOMS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToMovies" ADD CONSTRAINT "_CategoriesToMovies_A_fkey" FOREIGN KEY ("A") REFERENCES "CATEGORIES"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToMovies" ADD CONSTRAINT "_CategoriesToMovies_B_fkey" FOREIGN KEY ("B") REFERENCES "MOVIES"("id") ON DELETE CASCADE ON UPDATE CASCADE;


INSERT INTO "CATEGORIES" ("id", "name") VALUES (1, 'Action');
INSERT INTO "CATEGORIES" ("id", "name") VALUES (2, 'Adventure');
INSERT INTO "CATEGORIES" ("id", "name") VALUES (3, 'Comedy');

INSERT INTO "ROOMS" ("id", "name", "description", "capacity", "type", "open", "handicap_access") VALUES (1, 'Room 1', 'Room 1 description', 20, 'Normal', true, false);
INSERT INTO "ROOMS" ("id", "name", "description", "capacity", "type", "open", "handicap_access") VALUES (2, 'Room 2', 'Room 2 description', 20, 'Normal', true, false);
INSERT INTO "ROOMS" ("id", "name", "description", "capacity", "type", "open", "handicap_access") VALUES (3, 'Room 3', 'Room 3 description', 25, 'Normal', true, false);

INSERT INTO "MOVIES" ("id", "title", "author", "release_date", "description", "status", "duration") VALUES (1, 'Movie 1', 'Author 1', '2024-05-10', 'Movie 1 description', 'Now playing', 120);
INSERT INTO "MOVIES" ("id", "title", "author", "release_date", "description", "status", "duration") VALUES (2, 'Movie 2', 'Author 2', '2024-05-10', 'Movie 2 description', 'Now playing', 120);
INSERT INTO "MOVIES" ("id", "title", "author", "release_date", "description", "status", "duration") VALUES (3, 'Movie 3', 'Author 3', '2024-05-10', 'Movie 3 description', 'Now playing', 120);

INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (1, 1);
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (2, 1);
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (3, 1);
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (1, 2);
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (2, 2);
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (3, 2);
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (1, 3);
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (2, 3);
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (3, 3);


INSERT INTO "USERS" ("id", "first_name", "last_name", "email", "password", "money", "role", "token") VALUES (1, 'john', 'doe', 'john@email.com', '$2a$10$Gmr.sPnCt.XhoiDPC/guq.mjvc0uX5bhmG.PH/Gm8Nmk6WD9AKUKO', 0, 1, NULL);

INSERT INTO "EMPLOYEES" ("id", "first_name", "last_name", "email", "password", "phone_number", "token", "role") VALUES (1, 'jane', 'doe', 'jane@email.com', '$2a$10$Gmr.sPnCt.XhoiDPC/guq.mjvc0uX5bhmG.PH/Gm8Nmk6WD9AKUKO', '123456789', NULL, 2);
