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

INSERT INTO "CATEGORIES" ("name") VALUES ('Drama');
INSERT INTO "CATEGORIES" ("name") VALUES ('Crime');
INSERT INTO "CATEGORIES" ("name") VALUES ('Thriller');
INSERT INTO "CATEGORIES" ("name") VALUES ('Action');
INSERT INTO "CATEGORIES" ("name") VALUES ('Adventure');
INSERT INTO "CATEGORIES" ("name") VALUES ('Comedy');

INSERT INTO "ROOMS" ("name", "description", "capacity", "type", "open", "handicap_access") VALUES ('Room 1', 'Room 1 description', 20, 'Normal', true, false);
INSERT INTO "ROOMS" ("name", "description", "capacity", "type", "open", "handicap_access") VALUES ('Room 2', 'Room 2 description', 25, 'Normal', true, false);
INSERT INTO "ROOMS" ("name", "description", "capacity", "type", "open", "handicap_access") VALUES ('Room 3', 'Room 3 description', 30, 'Normal', true, true);
INSERT INTO "ROOMS" ("name", "description", "capacity", "type", "open", "handicap_access") VALUES ('Room 4', 'Room 4 description', 15, 'Normal', true, false);
INSERT INTO "ROOMS" ("name", "description", "capacity", "type", "open", "handicap_access") VALUES ('Room 5', 'Room 5 description', 22, 'Normal', true, true);

INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('Les Évadés', 'Frank Darabont', '1994-09-23', 'En 1947, Andy Dufresne, un jeune banquier, est condamné à la perpétuité pour le meurtre de sa femme et de son amant. Il est incarcéré à la prison d''État de Shawshank, où il se lie d''amitié avec Red, un ancien détenu. Ensemble, ils vont découvrir que l''espoir est un bien précieux qui ne s''éteint jamais.', 'Now playing', 142);
INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('Le Parrain', 'Francis Ford Coppola', '1972-03-14', 'En 1945, à New York, les Corleone sont l''une des cinq familles de la mafia. Don Vito Corleone, parrain de cette famille, marie sa fille à un bookmaker. Sollozzo, parrain de la famille Tattaglia, propose à Don Vito une association dans le trafic de drogue, mais celui-ci refuse.', 'Now playing', 175);
INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('The Dark Knight : Le Chevalier noir', 'Christopher Nolan', '2008-07-16', 'Dans ce nouveau volet, Batman augmente les mises dans sa guerre contre le crime. Avec l''appui du lieutenant de police Jim Gordon et du procureur de Gotham, Harvey Dent, Batman vise à éradiquer le crime organisé qui pullule dans la ville. Leur association est très efficace, mais elle sera bientôt bouleversée par le chaos déclenché par un criminel extraordinaire que les citoyens de Gotham connaissent sous le nom de Joker.', 'Now playing', 152);
INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('Pulp Fiction', 'Quentin Tarantino', '1994-09-10', 'L''histoire de plusieurs truands et de personnages marginaux dans un univers violent et déjanté. Le film est découpé en plusieurs séquences qui se chevauchent et qui mettent en scène des dialogues percutants et des scènes d''action spectaculaires.', 'Now playing', 154);
INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('Inception', 'Christopher Nolan', '2010-07-15', 'Dom Cobb est un voleur expérimenté, le meilleur dans l''art périlleux de l''extraction : sa spécialité consiste à s''approprier les secrets les plus précieux d''un individu, enfouis au plus profond de son subconscient, pendant qu''il rêve et que son esprit est particulièrement vulnérable. Très recherché pour ses talents dans l''univers trouble de l''espionnage industriel, Cobb est aussi devenu un fugitif traqué dans le monde entier qui a perdu tout ce qui lui est cher.', 'Now playing', 148);
INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('Le Silence des agneaux', 'Jonathan Demme', '1991-02-14', 'Clarice Starling, une jeune et brillante stagiaire du FBI, est chargée d''interviewer le dangereux tueur en série Hannibal Lecter, emprisonné depuis plusieurs années, afin de résoudre une affaire de meurtres en série.', 'Now playing', 118);
INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('Forrest Gump', 'Robert Zemeckis', '1994-07-06', 'Forrest Gump est un homme simple d''esprit mais au grand cœur. Il a grandi dans l''Alabama et a vécu de nombreuses aventures, des années 1950 à la fin du XXe siècle. Il a rencontré des personnalités célèbres, a assisté à des événements historiques importants et a connu l''amour, la tristesse, la guerre et la paix.', 'Now playing', 142);
INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('Le Seigneur des anneaux : La Communauté de l''anneau', 'Peter Jackson', '2001-12-19', 'Dans un monde imaginaire appelé la Terre du Milieu, le jeune hobbit Frodon Sacquet hérite d''un anneau magique. Cet anneau est en réalité un instrument de pouvoir absolu qui permettrait à Sauron, le Seigneur des ténèbres, de régner sur la Terre du Milieu et de réduire en esclavage tous ses peuples. Pour empêcher cela, Frodon et ses amis doivent entreprendre un long et périlleux voyage pour détruire l''anneau en le jetant dans les flammes de la Montagne du Destin.', 'Now playing', 178);
INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('La Liste de Schindler', 'Steven Spielberg', '1993-12-15', 'Pendant la Seconde Guerre mondiale, Oskar Schindler, un industriel allemand, sauve la vie de plus de mille Juifs en les employant dans son usine. Il profite de la situation pour s''enrichir, mais finit par prendre conscience de l''horreur du génocide et décide de tout mettre en œuvre pour sauver le plus grand nombre de vies possible.', 'Now playing', 195);
INSERT INTO "MOVIES" ("title", "author", "release_date", "description", "status", "duration") VALUES ('Star Wars, épisode V : L''Empire contre-attaque', 'Irvin Kershner', '1980-05-17', 'Après la destruction de l''Étoile Noire, l''Empire contre-attaque en envoyant des troupes sur la planète glacée de Hoth. Les rebelles doivent fuir et se disperser. Luke Skywalker part sur la planète Dagobah pour suivre l''enseignement du maître Jedi Yoda, tandis que Han Solo et la princesse Leia sont poursuivis par les troupes impériales à travers la galaxie.', 'Now playing', 124);


INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (1, 1); -- Drame, Les Évadés
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (2, 1); -- Policier, Les Évadés
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (1, 2); -- Drame, Le Parrain
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (2, 2); -- Policier, Le Parrain
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (2, 3); -- Policier, The Dark Knight : Le Chevalier noir
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (4, 3); -- Action, The Dark Knight : Le Chevalier noir
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (1, 4); -- Drame, Pulp Fiction
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (2, 4); -- Policier, Pulp Fiction
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (3, 5); -- Science-fiction, Inception
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (4, 5); -- Action, Inception
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (2, 6); -- Policier, Le Silence des agneaux
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (3, 6); -- Thriller, Le Silence des agneaux
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (1, 7); -- Drame, Forrest Gump
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (6, 7); -- Comédie, Forrest Gump
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (5, 8); -- Aventure, Le Seigneur des anneaux : La Communauté de l''anneau
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (6, 8); -- Fantastique, Le Seigneur des anneaux : La Communauté de l''anneau
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (1, 9); -- Drame, La Liste de Schindler
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (2, 9); -- Historique, La Liste de Schindler
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (4, 10); -- Science-fiction, Star Wars, épisode V : L''Empire contre-attaque
INSERT INTO "CATEGORIES_MOVIES" ("category_id", "movie_id") VALUES (5, 10); -- Aventure, Star Wars, épisode V : L''Empire contre-attaque



INSERT INTO "USERS" ("first_name", "last_name", "email", "password", "money", "role", "token") VALUES ('john', 'doe', 'john@email.com', '$2a$10$Gmr.sPnCt.XhoiDPC/guq.mjvc0uX5bhmG.PH/Gm8Nmk6WD9AKUKO', 0, 1, NULL);

INSERT INTO "EMPLOYEES" ("first_name", "last_name", "email", "password", "phone_number", "token", "role") VALUES ('jane', 'doe', 'jane@email.com', '$2a$10$Gmr.sPnCt.XhoiDPC/guq.mjvc0uX5bhmG.PH/Gm8Nmk6WD9AKUKO', '123456789', NULL, 2);
