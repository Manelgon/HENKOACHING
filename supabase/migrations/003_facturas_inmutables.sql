-- =============================================================================
-- MIGRACIÓN 003 — INMUTABILIDAD DE FACTURAS (F1 Verifactu hardening)
-- =============================================================================
-- Bloquea modificaciones fiscales de facturas ya emitidas como defensa en
-- profundidad antes de implementar la cadena de hashes y el envío AEAT.
--
--   · UPDATE en facturas: rechaza cambios en campos fiscales (cliente,
--     importes, IVA/IRPF, fechas de operación, numeración, rectificada_id).
--     Permite cambios en estado, pago, notas, vencimiento y pdf_path.
--   · UPDATE en factura_lineas: bloqueado siempre. Una vez creadas, las
--     líneas son inmutables.
--   · DELETE en facturas: solo si estado = 'anulada'.
--
-- Referencia: RD 1007/2023, art. 8 (no modificación de registros emitidos).
-- =============================================================================


-- =============================================================================
-- FACTURAS: trigger BEFORE UPDATE
-- =============================================================================
create or replace function public.facturas_prevent_fiscal_update()
returns trigger
language plpgsql
as $$
begin
  if new.numero               is distinct from old.numero               then raise exception 'Campo fiscal inmutable: numero (factura %)', old.numero               using errcode = 'check_violation'; end if;
  if new.serie                is distinct from old.serie                then raise exception 'Campo fiscal inmutable: serie (factura %)', old.numero                using errcode = 'check_violation'; end if;
  if new.anio                 is distinct from old.anio                 then raise exception 'Campo fiscal inmutable: anio (factura %)', old.numero                 using errcode = 'check_violation'; end if;
  if new.correlativo          is distinct from old.correlativo          then raise exception 'Campo fiscal inmutable: correlativo (factura %)', old.numero          using errcode = 'check_violation'; end if;
  if new.cliente_id           is distinct from old.cliente_id           then raise exception 'Campo fiscal inmutable: cliente_id (factura %)', old.numero           using errcode = 'check_violation'; end if;
  if new.cliente_nombre       is distinct from old.cliente_nombre       then raise exception 'Campo fiscal inmutable: cliente_nombre (factura %)', old.numero       using errcode = 'check_violation'; end if;
  if new.cliente_nif          is distinct from old.cliente_nif          then raise exception 'Campo fiscal inmutable: cliente_nif (factura %)', old.numero          using errcode = 'check_violation'; end if;
  if new.cliente_direccion    is distinct from old.cliente_direccion    then raise exception 'Campo fiscal inmutable: cliente_direccion (factura %)', old.numero    using errcode = 'check_violation'; end if;
  if new.cliente_email        is distinct from old.cliente_email        then raise exception 'Campo fiscal inmutable: cliente_email (factura %)', old.numero        using errcode = 'check_violation'; end if;
  if new.fecha_emision        is distinct from old.fecha_emision        then raise exception 'Campo fiscal inmutable: fecha_emision (factura %)', old.numero        using errcode = 'check_violation'; end if;
  if new.base_imponible       is distinct from old.base_imponible       then raise exception 'Campo fiscal inmutable: base_imponible (factura %)', old.numero       using errcode = 'check_violation'; end if;
  if new.iva_porcentaje       is distinct from old.iva_porcentaje       then raise exception 'Campo fiscal inmutable: iva_porcentaje (factura %)', old.numero       using errcode = 'check_violation'; end if;
  if new.iva_importe          is distinct from old.iva_importe          then raise exception 'Campo fiscal inmutable: iva_importe (factura %)', old.numero          using errcode = 'check_violation'; end if;
  if new.irpf_porcentaje      is distinct from old.irpf_porcentaje      then raise exception 'Campo fiscal inmutable: irpf_porcentaje (factura %)', old.numero      using errcode = 'check_violation'; end if;
  if new.irpf_importe         is distinct from old.irpf_importe         then raise exception 'Campo fiscal inmutable: irpf_importe (factura %)', old.numero         using errcode = 'check_violation'; end if;
  if new.total                is distinct from old.total                then raise exception 'Campo fiscal inmutable: total (factura %)', old.numero                using errcode = 'check_violation'; end if;
  if new.factura_rectificada_id is distinct from old.factura_rectificada_id then raise exception 'Campo fiscal inmutable: factura_rectificada_id (factura %)', old.numero using errcode = 'check_violation'; end if;
  if new.motivo_rectificacion is distinct from old.motivo_rectificacion then raise exception 'Campo fiscal inmutable: motivo_rectificacion (factura %)', old.numero using errcode = 'check_violation'; end if;

  return new;
end;
$$;

drop trigger if exists facturas_prevent_fiscal_update on public.facturas;
create trigger facturas_prevent_fiscal_update
  before update on public.facturas
  for each row execute function public.facturas_prevent_fiscal_update();


-- =============================================================================
-- FACTURAS: trigger BEFORE DELETE (solo anuladas)
-- =============================================================================
create or replace function public.facturas_prevent_delete_no_anulada()
returns trigger
language plpgsql
as $$
begin
  if old.estado <> 'anulada'::estado_factura then
    raise exception 'No se puede eliminar la factura % (estado %). Anúlala primero.',
      old.numero, old.estado
      using errcode = 'check_violation';
  end if;
  return old;
end;
$$;

drop trigger if exists facturas_prevent_delete_no_anulada on public.facturas;
create trigger facturas_prevent_delete_no_anulada
  before delete on public.facturas
  for each row execute function public.facturas_prevent_delete_no_anulada();


-- =============================================================================
-- FACTURA_LINEAS: trigger BEFORE UPDATE (siempre rechaza)
-- =============================================================================
-- Las líneas son inmutables tras su inserción. Si una factura está mal
-- emitida, debe emitirse una rectificativa.
create or replace function public.factura_lineas_prevent_update()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Las líneas de factura son inmutables. Emite una factura rectificativa para corregir.'
    using errcode = 'check_violation';
end;
$$;

drop trigger if exists factura_lineas_prevent_update on public.factura_lineas;
create trigger factura_lineas_prevent_update
  before update on public.factura_lineas
  for each row execute function public.factura_lineas_prevent_update();


-- =============================================================================
-- FIN
-- =============================================================================
