<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ExportDbSchema extends Command
{
    /**
     * The name and signature of the console command.
     *
     * php artisan db:schema-export {--format=json|md}
     */
    protected $signature = 'db:schema-export {--format=json : Export format (json or md)}';

    protected $description = 'Export database schema (tables, columns, indexes, foreign keys) into JSON or Markdown';

    public function handle()
    {
        $format = $this->option('format') ?? 'json';

        // If the view exists, query it; otherwise, fallback to INFORMATION_SCHEMA
        $schemaData = DB::select("
            SELECT 
                t.TABLE_NAME,
                t.TABLE_TYPE,
                t.ENGINE,
                t.TABLE_ROWS,
                ROUND(t.DATA_LENGTH / 1024 / 1024, 2) AS DATA_SIZE_MB,
                ROUND(t.INDEX_LENGTH / 1024 / 1024, 2) AS INDEX_SIZE_MB,
                t.CREATE_TIME,
                t.UPDATE_TIME,
                t.TABLE_COLLATION,
                c.ORDINAL_POSITION,
                c.COLUMN_NAME,
                c.COLUMN_TYPE,
                c.IS_NULLABLE,
                c.COLUMN_DEFAULT,
                c.COLUMN_KEY,
                c.EXTRA,
                c.COLLATION_NAME,
                c.COLUMN_COMMENT,
                s.INDEX_NAME,
                s.SEQ_IN_INDEX,
                s.NON_UNIQUE,
                s.INDEX_TYPE,
                fk.REFERENCED_TABLE_NAME AS parent_table,
                fk.REFERENCED_COLUMN_NAME AS parent_column,
                rc.UPDATE_RULE,
                rc.DELETE_RULE
            FROM INFORMATION_SCHEMA.TABLES t
            LEFT JOIN INFORMATION_SCHEMA.COLUMNS c
                   ON t.TABLE_SCHEMA = c.TABLE_SCHEMA
                  AND t.TABLE_NAME   = c.TABLE_NAME
            LEFT JOIN INFORMATION_SCHEMA.STATISTICS s
                   ON t.TABLE_SCHEMA = s.TABLE_SCHEMA
                  AND t.TABLE_NAME   = s.TABLE_NAME
                  AND c.COLUMN_NAME  = s.COLUMN_NAME
            LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk
                   ON t.TABLE_SCHEMA = fk.TABLE_SCHEMA
                  AND t.TABLE_NAME   = fk.TABLE_NAME
                  AND c.COLUMN_NAME  = fk.COLUMN_NAME
            LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
                   ON fk.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
                  AND fk.CONSTRAINT_NAME   = rc.CONSTRAINT_NAME
            WHERE t.TABLE_SCHEMA = DATABASE()
            ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION, s.INDEX_NAME
        ");

        if ($format === 'json') {
            $output = json_encode($schemaData, JSON_PRETTY_PRINT);
            File::put(storage_path('app/db_schema.json'), $output);
            $this->info("✅ Schema exported to storage/app/db_schema.json");
        } else {
            // Markdown format
            $markdown = "# Database Schema\n\n";
            $currentTable = null;
            foreach ($schemaData as $row) {
                if ($row->TABLE_NAME !== $currentTable) {
                    $currentTable = $row->TABLE_NAME;
                    $markdown .= "\n## Table: {$currentTable}\n";
                    $markdown .= "| Column | Type | Nullable | Default | Key | Extra |\n";
                    $markdown .= "|--------|------|----------|---------|-----|-------|\n";
                }
                $markdown .= "| {$row->COLUMN_NAME} | {$row->COLUMN_TYPE} | {$row->IS_NULLABLE} | {$row->COLUMN_DEFAULT} | {$row->COLUMN_KEY} | {$row->EXTRA} |\n";
            }
            File::put(storage_path('app/db_schema.md'), $markdown);
            $this->info("✅ Schema exported to storage/app/db_schema.md");
        }
    }
}
