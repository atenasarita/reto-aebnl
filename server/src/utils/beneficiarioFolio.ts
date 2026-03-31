import oracledb, { Connection } from 'oracledb';

export const BENEFICIARIO_FOLIO_PATTERN = '^ASEB-[0-9]{2}-[0-9]{4}$';

const SEQUENCE_WIDTH = 4;

function padSequence(value: number): string {
  return String(value).padStart(SEQUENCE_WIDTH, '0');
}

export async function generateNextBeneficiarioFolio(connection: Connection): Promise<string> {
  const prefixResult = await connection.execute<{ PREFIX: string }>(
    `SELECT 'ASEB-' || TO_CHAR(SYSDATE, 'YY') || '-' AS PREFIX FROM dual`,
    {},
    { outFormat: oracledb.OUT_FORMAT_OBJECT },
  );

  const prefixRow = prefixResult.rows?.[0];
  if (!prefixRow?.PREFIX) {
    throw new Error('Could not resolve folio year prefix from database.');
  }

  const yearPrefix = prefixRow.PREFIX;

  const seqResult = await connection.execute<{ NEXT_SEQ: number }>(
    `
      SELECT NVL(
               MAX(
                 TO_NUMBER(
                   SUBSTR(folio, LENGTH(:yearPrefix) + 1, :seqWidth)
                 )
               ),
               0
             ) + 1 AS NEXT_SEQ
      FROM Beneficiario
      WHERE SUBSTR(folio, 1, LENGTH(:yearPrefix)) = :yearPrefix
        AND REGEXP_LIKE(folio, :pattern)
    `,
    {
      yearPrefix,
      seqWidth: SEQUENCE_WIDTH,
      pattern: BENEFICIARIO_FOLIO_PATTERN,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT },
  );

  const nextSeq = seqResult.rows?.[0]?.NEXT_SEQ ?? 1;
  return yearPrefix + padSequence(nextSeq);
}
