# Carpeta _/back_

Aquesta carpeta ha de contenir tot el necessari per al desplegament i la configuració de l'entorn tant de producció com de desenvolupament.
Típicament:
 -  SQL DDL
 -  SQL DML
 -  Plugins o confguracions del editors o les eines
 -  altres dades d'interés
 -  dockers per aixecar entorns de prova..
 -  ...

NO HA DE CONTENIR EL PHP de l'aplicació

tr0-2024-2025-un-munt-de-preguntes-Simran0496

database:
-- Crear tabla preguntes
CREATE TABLE preguntes (
    id_pregunta INT AUTO_INCREMENT PRIMARY KEY,  -- ID único para cada pregunta
    pregunta VARCHAR(255) NOT NULL,              -- Texto de la pregunta
    resposta_correcta INT NOT NULL,              -- Índice de la respuesta correcta (0 a n)
    imatge VARCHAR(255)                          -- Ruta de la imagen asociada a la pregunta
);

-- Crear tabla respostes
CREATE TABLE respostes (
    id_resposta INT AUTO_INCREMENT PRIMARY KEY,  -- ID único para cada respuesta
    pregunta_id INT,                             -- Relación con la tabla preguntes (foreign key)
    resposta VARCHAR(255) NOT NULL,              -- Texto de la respuesta
        FOREIGN KEY (pregunta_id) 
        REFERENCES preguntes(id_pregunta)
        ON DELETE CASCADE                        -- Elimina respuestas si se borra la pregunta
);

