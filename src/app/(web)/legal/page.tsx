import Link from 'next/link'

const ULTIMA_ACTUALIZACION = '4 de junio de 2026'

export default function Legal() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link href="/" className="inline-flex items-center text-henko-greenblue hover:text-henko-greenblue/80 text-sm font-raleway font-semibold mb-6 transition-colors">
            ← Volver
          </Link>
          <h1 className="font-raleway text-3xl md:text-4xl font-bold text-gray-900 mb-4">Legal</h1>
          <p className="text-gray-600 font-raleway text-lg">Información legal, privacidad y políticas de Henkoaching</p>
          <p className="text-gray-400 font-raleway text-xs mt-3">Última actualización: {ULTIMA_ACTUALIZACION}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-20">
        {/* Navigation */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'aviso-legal', label: 'Aviso Legal' },
            { id: 'privacidad', label: 'Política de Privacidad' },
            { id: 'cookies', label: 'Política de Cookies' },
            { id: 'accesibilidad', label: 'Accesibilidad' },
          ].map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-4 py-3 rounded-lg border border-gray-200 hover:border-henko-greenblue hover:bg-henko-greenblue/5 text-gray-700 hover:text-henko-greenblue font-raleway text-sm font-semibold transition-all duration-300 text-center"
            >
              {section.label}
            </a>
          ))}
        </div>

        {/* Aviso Legal */}
        <section id="aviso-legal" className="mb-16 scroll-mt-20">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-henko-greenblue">
            Aviso Legal
          </h2>
          <div className="space-y-4 text-gray-700 font-raleway">
            <p>
              En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de los siguientes datos identificativos del titular del sitio web:
            </p>
            <div className="bg-gray-50 rounded-xl p-5 my-4 space-y-1">
              <p><strong>Titular:</strong> Jennifer Cervera Alzate</p>
              <p><strong>NIF:</strong> 43209692Y</p>
              <p><strong>Domicilio:</strong> Calle Pere Quintana 25, 07008 Palma de Mallorca, Illes Balears, España</p>
              <p><strong>Email de contacto:</strong> <a href="mailto:info@henkoaching.com" className="text-henko-greenblue hover:underline">info@henkoaching.com</a></p>
              <p><strong>Nombre comercial:</strong> Henkoaching</p>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Objeto</h3>
            <p>
              Este sitio web tiene como finalidad ofrecer servicios de coaching empresarial, así como gestionar procesos de selección de personal a través de su bolsa de empleo. El uso del sitio atribuye la condición de Usuario e implica la aceptación de todas las condiciones aquí establecidas.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Propiedad intelectual</h3>
            <p>
              Todos los contenidos de este sitio (textos, imágenes, diseño, código fuente, marcas, logotipos) son titularidad de Jennifer Cervera Alzate o cuentan con la correspondiente licencia, y están protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Uso del sitio</h3>
            <p>
              El Usuario se compromete a hacer un uso adecuado y lícito del sitio web. Queda prohibido:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Reproducir, distribuir o transmitir contenidos sin autorización.</li>
              <li>Realizar actividades ilícitas o que vulneren derechos de terceros.</li>
              <li>Interferir con el funcionamiento normal del sitio o intentar acceder a áreas restringidas.</li>
              <li>Introducir programas, virus o cualquier elemento que pueda dañar el sitio o los sistemas de terceros.</li>
              <li>Suplantar la identidad de otros usuarios o aportar datos falsos en los formularios.</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Limitación de responsabilidad</h3>
            <p>
              La titular no será responsable de:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Interrupciones, errores o fallos en el funcionamiento del sitio que no le sean directamente imputables.</li>
              <li>Daños derivados del uso indebido del sitio por parte del Usuario.</li>
              <li>Contenidos de sitios de terceros a los que se pueda acceder mediante enlaces desde este sitio.</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Legislación y jurisdicción</h3>
            <p>
              Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Palma de Mallorca, salvo que la normativa aplicable establezca otro fuero.
            </p>
          </div>
        </section>

        {/* Política de Privacidad */}
        <section id="privacidad" className="mb-16 scroll-mt-20">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-henko-greenblue">
            Política de Privacidad
          </h2>
          <div className="space-y-4 text-gray-700 font-raleway">
            <p>
              En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD), se informa al Usuario sobre el tratamiento de sus datos personales.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">1. Responsable del tratamiento</h3>
            <div className="bg-gray-50 rounded-xl p-5 my-2 space-y-1">
              <p><strong>Responsable:</strong> Jennifer Cervera Alzate</p>
              <p><strong>NIF:</strong> 43209692Y</p>
              <p><strong>Domicilio:</strong> Calle Pere Quintana 25, 07008 Palma de Mallorca, España</p>
              <p><strong>Email para asuntos de privacidad:</strong> <a href="mailto:info@henkoaching.com" className="text-henko-greenblue hover:underline">info@henkoaching.com</a></p>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">2. Finalidades del tratamiento</h3>
            <p>Los datos que nos facilitas se tratan con las siguientes finalidades, según el formulario o servicio utilizado:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Formulario de contacto:</strong> atender tu consulta y, en su caso, prestarte los servicios solicitados.</li>
              <li><strong>Registro como candidato y envío de CV:</strong> gestionar tu candidatura en los procesos de selección publicados, evaluar tu perfil profesional y contactarte si tu perfil encaja con alguna oferta.</li>
              <li><strong>Aplicación a ofertas concretas:</strong> tramitar tu solicitud para el puesto al que aplicas y comunicarte el estado del proceso.</li>
              <li><strong>Cumplimiento de obligaciones legales:</strong> conservación de registros cuando una norma así lo exija.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">3. Base legal</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Consentimiento del interesado</strong> (art. 6.1.a RGPD), prestado al marcar la casilla correspondiente al enviar el formulario o crear tu perfil de candidato.</li>
              <li><strong>Ejecución de medidas precontractuales</strong> (art. 6.1.b RGPD), cuando aplicas a una oferta concreta y procede gestionar tu candidatura.</li>
              <li><strong>Cumplimiento de obligaciones legales</strong> (art. 6.1.c RGPD) aplicables al responsable.</li>
            </ul>
            <p>El consentimiento puede retirarse en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">4. Datos que tratamos</h3>
            <p>Recogemos datos personales a través de los siguientes canales:</p>
            <div className="my-4 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-2">Formulario de contacto</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Empresa (opcional)</li>
                  <li>Tipo de necesidad / servicio solicitado</li>
                  <li>Mensaje descriptivo</li>
                  <li>Dirección IP (recogida automáticamente)</li>
                  <li>Fecha y hora del envío</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-2">Registro como candidato</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li><strong>Identificativos y de contacto:</strong> nombre, apellidos, email, teléfono, ubicación, código postal.</li>
                  <li><strong>Profesionales:</strong> cargo actual, experiencia laboral, formación, idiomas, currículum vítae (PDF), enlaces a LinkedIn o web propia, disponibilidad, pretensión salarial.</li>
                  <li>Dirección IP (recogida automáticamente al crear la cuenta)</li>
                </ul>
              </div>
            </div>
            <p>Solo solicitamos los datos estrictamente necesarios para la finalidad declarada (principio de minimización, art. 5.1.c RGPD).</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">5. Plazos de conservación</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>CVs y datos de candidatos no seleccionados:</strong> se conservan durante un máximo de <strong>12 meses</strong> desde la última actividad del usuario en la cuenta, salvo que el interesado solicite su eliminación antes.</li>
              <li><strong>Datos de candidatos contratados:</strong> durante la relación contractual y los plazos legales aplicables (fiscal, laboral) tras su finalización.</li>
              <li><strong>Mensajes del formulario de contacto:</strong> hasta 24 meses desde el último contacto, salvo solicitud de borrado previa.</li>
              <li><strong>Datos fiscales de facturación (clientes, facturas y registros Veri*factu):</strong> 6 años desde la emisión de la factura, conforme al Código de Comercio (art. 30) y la normativa tributaria. Durante este plazo los registros son inmutables y no pueden ser borrados ni modificados.</li>
              <li>Transcurridos estos plazos, los datos son eliminados o anonimizados de forma segura.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">6. Destinatarios de los datos</h3>
            <p>
              Tus datos <strong>no se ceden a terceros con fines comerciales</strong>. Para prestar el servicio utilizamos los siguientes encargados del tratamiento con garantías RGPD:
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Destinatario</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Finalidad</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Ubicación</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Garantía</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-gray-200">
                    <td className="p-3 border border-gray-200 font-semibold">Supabase Inc.</td>
                    <td className="p-3 border border-gray-200">Base de datos, autenticación y almacenamiento de archivos (CVs)</td>
                    <td className="p-3 border border-gray-200">UE — Irlanda (eu-west-1)</td>
                    <td className="p-3 border border-gray-200">
                      <a href="https://supabase.com/dpa" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue underline">DPA firmado</a>{' '}·{' '}
                      <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue underline">Privacidad</a>
                    </td>
                  </tr>
                  <tr className="border border-gray-200 bg-gray-50/50">
                    <td className="p-3 border border-gray-200 font-semibold">Vercel Inc.</td>
                    <td className="p-3 border border-gray-200">Alojamiento del sitio web y CDN</td>
                    <td className="p-3 border border-gray-200">EE. UU. — Cláusulas contractuales tipo (SCCs)</td>
                    <td className="p-3 border border-gray-200">
                      <a href="https://vercel.com/legal/dpa" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue underline">DPA firmado</a>{' '}·{' '}
                      <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue underline">Privacidad</a>
                    </td>
                  </tr>
                  <tr className="border border-gray-200">
                    <td className="p-3 border border-gray-200 font-semibold">Piensa Solutions S.L.</td>
                    <td className="p-3 border border-gray-200">Envío de emails transaccionales (confirmaciones de registro, notificaciones de candidatura)</td>
                    <td className="p-3 border border-gray-200">España (UE)</td>
                    <td className="p-3 border border-gray-200">
                      <a href="https://www.piensasolutions.com/legal/privacidad" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue underline">Política de privacidad</a>
                      {' '}— Empresa española sujeta a RGPD/LOPDGDD
                    </td>
                  </tr>
                  <tr className="border border-gray-200 bg-gray-50/50">
                    <td className="p-3 border border-gray-200 font-semibold">AEAT (Veri*factu)</td>
                    <td className="p-3 border border-gray-200">Comunicación obligatoria de registros de facturación electrónica</td>
                    <td className="p-3 border border-gray-200">España</td>
                    <td className="p-3 border border-gray-200">Obligación legal — RD 1007/2023 y Orden HAC/1177/2024 (art. 6.1.c RGPD)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600">No se realizan otras transferencias internacionales de datos fuera del Espacio Económico Europeo, salvo las indicadas en la tabla anterior con las garantías correspondientes.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">7. Decisiones automatizadas</h3>
            <p>
              No se aplican decisiones automatizadas ni perfilado en el tratamiento de tus datos. La valoración de candidaturas es realizada de forma individual y humana.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">8. Derechos del interesado</h3>
            <p>De acuerdo con los artículos 15 a 22 del RGPD, tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Acceso:</strong> conocer qué datos tuyos tratamos.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión (&ldquo;derecho al olvido&rdquo;):</strong> solicitar la eliminación de tus datos.</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento.</li>
              <li><strong>Limitación:</strong> restringir el tratamiento en determinados casos.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
              <li><strong>No ser objeto de decisiones automatizadas.</strong></li>
              <li><strong>Retirar el consentimiento</strong> en cualquier momento.</li>
            </ul>
            <p>
              Puedes ejercer estos derechos de dos formas:
            </p>
            <div className="my-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/legal/derechos-arco"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-henko-greenblue text-white font-raleway font-semibold text-sm hover:bg-henko-greenblue/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Formulario online de derechos RGPD
              </Link>
              <a
                href="mailto:info@henkoaching.com"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-henko-greenblue text-henko-greenblue font-raleway font-semibold text-sm hover:bg-henko-greenblue/5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email: info@henkoaching.com
              </a>
            </div>
            <p className="text-sm text-gray-500">Atenderemos tu solicitud en el plazo máximo de un mes conforme al art. 12 RGPD. Puede que solicitemos una copia de documento identificativo para verificar tu identidad.</p>
            <p>
              Si consideras que el tratamiento de tus datos no se ajusta a la normativa, puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (AEPD) a través de su sede electrónica:{' '}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue hover:underline font-semibold">www.aepd.es</a>.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">9. Seguridad</h3>
            <p>
              Aplicamos medidas técnicas y organizativas apropiadas para garantizar la seguridad de tus datos: cifrado en tránsito (HTTPS), cifrado en reposo de la base de datos, control de accesos basado en roles, almacenamiento de CVs en bucket privado y registro de auditoría de accesos a datos sensibles.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">10. Veracidad y menores</h3>
            <p>
              El Usuario garantiza la veracidad de los datos aportados y se compromete a mantenerlos actualizados. Este sitio no está dirigido a menores de 16 años; en caso de detectar el registro de un menor sin consentimiento de sus representantes legales, los datos serán suprimidos.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">11. Cambios en la política</h3>
            <p>
              Esta política puede actualizarse para adaptarse a cambios normativos o de servicio. Se publicará siempre la fecha de la última actualización al inicio del documento. Si los cambios son sustanciales, se notificarán a los usuarios registrados.
            </p>
          </div>
        </section>

        {/* Política de Cookies */}
        <section id="cookies" className="mb-16 scroll-mt-20">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-henko-greenblue">
            Política de Cookies
          </h2>
          <div className="space-y-4 text-gray-700 font-raleway">
            <p>
              Una cookie es un pequeño archivo que el sitio web descarga en el dispositivo del Usuario al visitarlo. Las cookies permiten, entre otras cosas, mantener una sesión iniciada o reconocer al Usuario en visitas posteriores.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Cookies que utiliza este sitio</h3>
            <p>
              Actualmente este sitio web utiliza <strong>únicamente cookies técnicas estrictamente necesarias</strong> para su funcionamiento. Estas cookies <strong>están exentas del deber de consentimiento</strong> conforme al artículo 22.2 de la LSSI-CE y la Guía sobre el uso de cookies de la Agencia Española de Protección de Datos.
            </p>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 border-b border-gray-200">Cookie</th>
                    <th className="text-left p-3 border-b border-gray-200">Finalidad</th>
                    <th className="text-left p-3 border-b border-gray-200">Tipo</th>
                    <th className="text-left p-3 border-b border-gray-200">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-gray-200 font-mono text-xs">sb-*-auth-token</td>
                    <td className="p-3 border-b border-gray-200">Mantener la sesión iniciada del usuario registrado (Supabase Auth).</td>
                    <td className="p-3 border-b border-gray-200">Técnica propia</td>
                    <td className="p-3 border-b border-gray-200">1 hora (rotativa)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">sb-*-refresh-token</td>
                    <td className="p-3">Renovar automáticamente la sesión sin necesidad de reintroducir credenciales.</td>
                    <td className="p-3">Técnica propia</td>
                    <td className="p-3">30 días</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Cookies analíticas, publicitarias o de terceros</h3>
            <p>
              Este sitio <strong>no utiliza</strong> cookies de análisis, publicidad, redes sociales ni de terceros. Si en el futuro se incorporasen, se solicitará el consentimiento previo, informado y específico del Usuario mediante el banner correspondiente antes de instalarlas.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Cómo desactivar las cookies</h3>
            <p>
              Puedes configurar tu navegador para bloquear, eliminar o ser avisado cuando se instalen cookies. Ten en cuenta que desactivar las cookies técnicas puede impedir el correcto funcionamiento del área privada del sitio (login, dashboard de candidato, etc.).
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/proteccion-mejorada-contra-rastreo-firefox-escritorio" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-henko-greenblue hover:underline">Microsoft Edge</a></li>
            </ul>
          </div>
        </section>

        {/* Declaración de Accesibilidad */}
        <section id="accesibilidad" className="mb-16 scroll-mt-20">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-henko-greenblue">
            Declaración de Accesibilidad
          </h2>
          <div className="space-y-4 text-gray-700 font-raleway">
            <p>
              Henkoaching se compromete a garantizar la accesibilidad digital para todas las personas, incluidas aquellas con discapacidades.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Estándares de accesibilidad</h3>
            <p>
              Nuestro sitio web ha sido diseñado y desarrollado siguiendo las pautas de Accesibilidad al Contenido Web (WCAG) 2.1 nivel AA del W3C.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Características de accesibilidad</h3>
            <p>El sitio incluye:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Navegación por teclado.</li>
              <li>Contraste de colores adecuado.</li>
              <li>Textos alternativos en imágenes.</li>
              <li>Estructura semántica del HTML.</li>
              <li>Información de formularios claramente etiquetada.</li>
              <li>Compatibilidad con lectores de pantalla.</li>
              <li>Tamaño de fuente escalable.</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Reportar problemas de accesibilidad</h3>
            <p>
              Si encuentras problemas de accesibilidad mientras navegas este sitio, puedes contactarnos a través del{' '}
              <Link href="/contacto" className="text-henko-greenblue hover:text-henko-greenblue/80 font-semibold transition-colors">formulario de contacto</Link>
              {' '}o enviando un correo a{' '}
              <a href="mailto:info@henkoaching.com" className="text-henko-greenblue hover:underline font-semibold">info@henkoaching.com</a>.
            </p>
          </div>
        </section>

        {/* Back to top */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <Link
            href="#aviso-legal"
            className="inline-flex items-center justify-center border border-gray-300 hover:border-henko-greenblue bg-white hover:bg-henko-greenblue/5 rounded-full text-gray-900 hover:text-henko-greenblue text-xs font-bold tracking-widest uppercase px-6 py-3 transition-all duration-300"
          >
            ↑ Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
