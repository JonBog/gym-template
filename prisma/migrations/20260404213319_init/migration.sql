-- CreateTable
CREATE TABLE `Gym` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `ciudad` VARCHAR(191) NULL,
    `pais` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Gym_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `gymId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `passwordHash` VARCHAR(191) NULL,
    `rol` ENUM('ALUMNO', 'ENTRENADOR', 'ADMIN_GYM') NOT NULL DEFAULT 'ALUMNO',
    `avatarUrl` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_gymId_rol_idx`(`gymId`, `rol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AsignacionAlumno` (
    `id` VARCHAR(191) NOT NULL,
    `entrenadorId` VARCHAR(191) NOT NULL,
    `alumnoId` VARCHAR(191) NOT NULL,
    `asignadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activa` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `AsignacionAlumno_entrenadorId_alumnoId_key`(`entrenadorId`, `alumnoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rutina` (
    `id` VARCHAR(191) NOT NULL,
    `alumnoId` VARCHAR(191) NOT NULL,
    `entrenadorId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `vigenciaDesde` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `vigenciaHasta` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RutinaDia` (
    `id` VARCHAR(191) NOT NULL,
    `rutinaId` VARCHAR(191) NOT NULL,
    `dia` ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') NOT NULL,
    `nombre` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `RutinaDia_rutinaId_dia_key`(`rutinaId`, `dia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ejercicio` (
    `id` VARCHAR(191) NOT NULL,
    `rutinaDiaId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `series` INTEGER NULL,
    `repsMin` INTEGER NULL,
    `repsMax` INTEGER NULL,
    `pesoKg` DOUBLE NULL,
    `pesoNota` VARCHAR(191) NULL,
    `descansoSeg` INTEGER NULL,
    `duracionMin` DOUBLE NULL,
    `distanciaKm` DOUBLE NULL,
    `notas` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EjercicioCompletado` (
    `id` VARCHAR(191) NOT NULL,
    `ejercicioId` VARCHAR(191) NOT NULL,
    `alumnoId` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `seriesHechas` INTEGER NULL,
    `repsHechas` INTEGER NULL,
    `pesoUsadoKg` DOUBLE NULL,
    `notas` VARCHAR(191) NULL,

    INDEX `EjercicioCompletado_alumnoId_fecha_idx`(`alumnoId`, `fecha`),
    UNIQUE INDEX `EjercicioCompletado_ejercicioId_alumnoId_fecha_key`(`ejercicioId`, `alumnoId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanNutricional` (
    `id` VARCHAR(191) NOT NULL,
    `alumnoId` VARCHAR(191) NOT NULL,
    `entrenadorId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `objetivo` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `kcalObjetivo` INTEGER NULL,
    `proteinaG` DOUBLE NULL,
    `carbosG` DOUBLE NULL,
    `grasaG` DOUBLE NULL,
    `vigenciaDesde` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `vigenciaHasta` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanNutricionDia` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `dia` ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') NOT NULL,
    `nombre` VARCHAR(191) NULL,

    UNIQUE INDEX `PlanNutricionDia_planId_dia_key`(`planId`, `dia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comida` (
    `id` VARCHAR(191) NOT NULL,
    `diaId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `hora` VARCHAR(191) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alimento` (
    `id` VARCHAR(191) NOT NULL,
    `comidaId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `kcal` DOUBLE NULL,
    `proteinaG` DOUBLE NULL,
    `carbosG` DOUBLE NULL,
    `grasaG` DOUBLE NULL,
    `notas` VARCHAR(191) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Progreso` (
    `id` VARCHAR(191) NOT NULL,
    `alumnoId` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pesoKg` DOUBLE NULL,
    `grasaCorporal` DOUBLE NULL,
    `masaMuscularKg` DOUBLE NULL,
    `cinturaCm` DOUBLE NULL,
    `caderaCm` DOUBLE NULL,
    `pechoCm` DOUBLE NULL,
    `brazoCm` DOUBLE NULL,
    `notas` VARCHAR(191) NULL,

    INDEX `Progreso_alumnoId_fecha_idx`(`alumnoId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_gymId_fkey` FOREIGN KEY (`gymId`) REFERENCES `Gym`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignacionAlumno` ADD CONSTRAINT `AsignacionAlumno_entrenadorId_fkey` FOREIGN KEY (`entrenadorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignacionAlumno` ADD CONSTRAINT `AsignacionAlumno_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rutina` ADD CONSTRAINT `Rutina_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rutina` ADD CONSTRAINT `Rutina_entrenadorId_fkey` FOREIGN KEY (`entrenadorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RutinaDia` ADD CONSTRAINT `RutinaDia_rutinaId_fkey` FOREIGN KEY (`rutinaId`) REFERENCES `Rutina`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ejercicio` ADD CONSTRAINT `Ejercicio_rutinaDiaId_fkey` FOREIGN KEY (`rutinaDiaId`) REFERENCES `RutinaDia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EjercicioCompletado` ADD CONSTRAINT `EjercicioCompletado_ejercicioId_fkey` FOREIGN KEY (`ejercicioId`) REFERENCES `Ejercicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EjercicioCompletado` ADD CONSTRAINT `EjercicioCompletado_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanNutricional` ADD CONSTRAINT `PlanNutricional_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanNutricional` ADD CONSTRAINT `PlanNutricional_entrenadorId_fkey` FOREIGN KEY (`entrenadorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanNutricionDia` ADD CONSTRAINT `PlanNutricionDia_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `PlanNutricional`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comida` ADD CONSTRAINT `Comida_diaId_fkey` FOREIGN KEY (`diaId`) REFERENCES `PlanNutricionDia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alimento` ADD CONSTRAINT `Alimento_comidaId_fkey` FOREIGN KEY (`comidaId`) REFERENCES `Comida`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Progreso` ADD CONSTRAINT `Progreso_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
