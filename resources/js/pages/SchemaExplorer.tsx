import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface SchemaRow {
  TABLE_NAME: string;
  ENGINE: string;
  TABLE_ROWS: number | null;
  TABLE_COLLATION: string | null;
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
  IS_NULLABLE: "YES" | "NO";
  COLUMN_DEFAULT: string | null;
  COLUMN_KEY: string | null;
  EXTRA: string | null;
  COLUMN_COMMENT: string | null;
  parent_table?: string | null;
  parent_column?: string | null;
  UPDATE_RULE?: string | null;
  DELETE_RULE?: string | null;
}

export default function SchemaExplorer() {
  const [schema, setSchema] = useState<SchemaRow[]>([]);

  useEffect(() => {
    fetch("/api/schema")
      .then((res) => res.json())
      .then((data) => {
        // Ensure we always have an array
        if (Array.isArray(data)) {
          setSchema(data);
        } else if (data && Array.isArray(data.data)) {
          setSchema(data.data);
        } else {
          console.warn("Unexpected schema format:", data);
          setSchema([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch schema:", err);
        setSchema([]);
      });
  }, []);

  // Safe grouping: only if schema is an array
  const grouped: Record<string, SchemaRow[]> = Array.isArray(schema)
    ? schema.reduce((acc, row) => {
        if (!acc[row.TABLE_NAME]) acc[row.TABLE_NAME] = [];
        acc[row.TABLE_NAME].push(row);
        return acc;
      }, {} as Record<string, SchemaRow[]>)
    : {};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Database Schema Explorer</h1>

      {Object.keys(grouped).length === 0 ? (
        <p>Loading schema...</p>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {Object.keys(grouped).map((table) => {
            const cols = grouped[table];
            const foreignKeys = cols.filter((col) => col.parent_table);

            return (
              <AccordionItem key={table} value={table}>
                <AccordionTrigger className="text-lg font-semibold">
                  {table}
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-4">
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">
                        Engine: {cols[0].ENGINE} | Rows:{" "}
                        {cols[0].TABLE_ROWS ?? "?"} | Collation:{" "}
                        {cols[0].TABLE_COLLATION}
                      </p>

                      {/* Columns Table */}
                      <h2 className="font-semibold mb-2">Columns</h2>
                      <table className="w-full border-collapse text-sm mb-4">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="p-2">Column</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Nullable</th>
                            <th className="p-2">Default</th>
                            <th className="p-2">Key</th>
                            <th className="p-2">Extra</th>
                            <th className="p-2">Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cols.map((col, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2">{col.COLUMN_NAME}</td>
                              <td className="p-2">{col.COLUMN_TYPE}</td>
                              <td className="p-2">{col.IS_NULLABLE}</td>
                              <td className="p-2">{col.COLUMN_DEFAULT ?? "—"}</td>
                              <td className="p-2">{col.COLUMN_KEY ?? "—"}</td>
                              <td className="p-2">{col.EXTRA ?? "—"}</td>
                              <td className="p-2">{col.COLUMN_COMMENT ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Foreign Keys */}
                      {foreignKeys.length > 0 && (
                        <>
                          <h2 className="font-semibold mb-2">Foreign Keys</h2>
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr className="border-b text-left">
                                <th className="p-2">Column</th>
                                <th className="p-2">References</th>
                                <th className="p-2">Update Rule</th>
                                <th className="p-2">Delete Rule</th>
                              </tr>
                            </thead>
                            <tbody>
                              {foreignKeys.map((fk, idx) => (
                                <tr key={idx} className="border-b">
                                  <td className="p-2">{fk.COLUMN_NAME}</td>
                                  <td className="p-2">
                                    {fk.parent_table}.{fk.parent_column}
                                  </td>
                                  <td className="p-2">{fk.UPDATE_RULE ?? "—"}</td>
                                  <td className="p-2">{fk.DELETE_RULE ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
