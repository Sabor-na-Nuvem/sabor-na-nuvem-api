/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     description: Cria uma nova conta de usuário, envia um email de verificação e cria um relatório de usuário associado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroUsuarioInput'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso. (Email de verificação enviado).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Email já cadastrado ou dados inválidos.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Efetua login e obtém tokens
 *     tags: [Auth]
 *     description: Autentica um usuário com email e senha. Retorna um `accessToken` no corpo e um `refreshToken` em um cookie httpOnly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login bem-sucedido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6...s'
 *       401:
 *         description: Credenciais inválidas ou email não verificado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verifica o email de um usuário (link do email)
 *     tags: [Auth]
 *     description: Valida o token enviado por email. Esta rota é acessada pelo usuário clicando no link de verificação.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: O token de verificação recebido por email.
 *     responses:
 *       302:
 *         description: Redireciona para a URL de sucesso do frontend (/login?verificado=true, por exemplo).
 *       400:
 *         description: Redireciona para a URL de erro do frontend (/login?error=token-invalido, por exemplo).
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna o perfil do usuário logado (teste de token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Rota de utilidade para verificar se um `accessToken` é válido e quem é o usuário.
 *     responses:
 *       200:
 *         description: Dados do usuário (id, email, cargo).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegistroUsuarioInput:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           example: 'João Teste'
 *         email:
 *           type: string
 *           format: email
 *           example: 'joao.teste@email.com'
 *         senha:
 *           type: string
 *           format: password
 *           example: 'senhaForte123'
 *     LoginInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: 'joao.teste@email.com'
 *         senha:
 *           type: string
 *           format: password
 *           example: 'senhaForte123'
 */
