INSERT INTO users (name, username, password, admin) VALUES ('Óli admin', 'admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', true);
INSERT INTO users (name, username, password) VALUES ('Forvitinn forritari', 'forritari', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name, username, password) VALUES ('Jón Jónsson', 'jonjons', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name, username, password) VALUES ('Guðrún Guðrúnar', 'gunnagunn', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');

INSERT INTO events (name, slug, location, url, description) VALUES ('Forritarahittingur í febrúar', 'forritarahittingur-i-februar', null, null, 'Forritarar hittast í febrúar og forrita saman eitthvað frábært.');
INSERT INTO events (name, slug, location, url, description) VALUES ('Hönnuðahittingur í mars', 'honnudahittingur-i-mars', 'Hönnunarhúsinu', null, 'Spennandi hittingur hönnuða í Hönnunarmars.');
INSERT INTO events (name, slug, location, url, description) VALUES ('Verkefnastjórahittingur í apríl', 'verkefnastjorahittingur-i-april', null, 'https://hi.is/', 'Virkilega vel verkefnastýrður hittingur.');

INSERT INTO registrations (userId, comment, event) VALUES (2, 'Hlakka til að forrita með ykkur', 1);
INSERT INTO registrations (userId, comment, event) VALUES (3, null, 1);
INSERT INTO registrations (userId, comment, event) VALUES (4, 'verður vefforritað?', 1);
