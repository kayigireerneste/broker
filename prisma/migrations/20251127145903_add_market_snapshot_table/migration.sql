-- CreateTable
CREATE TABLE `MarketSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NULL,
    `security` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NULL,
    `closingPrice` DECIMAL(18, 2) NULL,
    `previousClosingPrice` DECIMAL(18, 2) NULL,
    `priceChange` VARCHAR(191) NULL,
    `tradedVolume` DECIMAL(18, 2) NULL,
    `tradedValue` DECIMAL(18, 2) NULL,
    `snapshotDate` DATETIME(3) NOT NULL,
    `sourceUrl` VARCHAR(191) NULL,
    `syncedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MarketSnapshot_companyId_idx`(`companyId`),
    INDEX `MarketSnapshot_symbol_idx`(`symbol`),
    INDEX `MarketSnapshot_snapshotDate_idx`(`snapshotDate`),
    INDEX `MarketSnapshot_syncedAt_idx`(`syncedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
