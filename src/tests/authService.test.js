// IMPORTANTE:
// Não faça require() do authService / bcrypt / jwt / userRepo aqui em cima,
// porque isso pode carregar módulos antes do Jest aplicar os mocks corretamente.

jest.mock("../../src/repositories/userRepository", () => ({
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

describe("Auth Service Unit Tests (6-9)", () => {
  let authService;
  let userRepo;
  let bcrypt;
  let jwt;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Seu authService exige JWT_SECRET configurado para sign/verify
    process.env.JWT_SECRET = "test_secret";

    // Agora sim: carrega os módulos já com mocks aplicados
    userRepo = require("../../src/repositories/userRepository");
    bcrypt = require("bcryptjs");
    jwt = require("jsonwebtoken");
    authService = require("../../src/services/authService");
  });

  // 6. Registro
  describe("register", () => {
    it("deve registrar um usuário com sucesso (dados válidos)", async () => {
      userRepo.findByUsername.mockResolvedValue(null);
      userRepo.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed_password");
      userRepo.create.mockResolvedValue({ id: 1 });

      const result = await authService.register({
        username: "user1",
        email: "user1@test.com",
        password: "password123"
      });

      expect(result.status).toBe(201);
      expect(result.data.message).toBe("User registered successfully");
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(userRepo.create).toHaveBeenCalledWith({
        username: "user1",
        email: "user1@test.com",
        passwordHash: "hashed_password"
      });
    });

    it("deve retornar erro quando faltarem dados", async () => {
      const result = await authService.register({ username: "user1" });
      expect(result.status).toBe(400);
      expect(result.error).toBe("username, email and password are required");
    });

    it("deve retornar erro quando username já existir", async () => {
      userRepo.findByUsername.mockResolvedValue({ id: 99 });

      const result = await authService.register({
        username: "user1",
        email: "user1@test.com",
        password: "password123"
      });

      expect(result.status).toBe(409);
      expect(result.error).toBe("User already exists");
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    it("deve retornar erro quando email já existir", async () => {
      userRepo.findByUsername.mockResolvedValue(null);
      userRepo.findByEmail.mockResolvedValue({ id: 99 });

      const result = await authService.register({
        username: "user1",
        email: "user1@test.com",
        password: "password123"
      });

      expect(result.status).toBe(409);
      expect(result.error).toBe("User already exists");
      expect(userRepo.create).not.toHaveBeenCalled();
    });
  });

  // 7. Login
  describe("login", () => {
    it("deve fazer login com credenciais válidas", async () => {
      const mockUser = { id: 1, username: "user1", passwordHash: "hash" };
      userRepo.findByUsername.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mock_token");

      const result = await authService.login({
        username: "user1",
        password: "password123"
      });

      expect(result.status).toBe(200);
      expect(result.data.access_token).toBe("mock_token");

      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hash");
      expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, "test_secret", { expiresIn: "1h" });
    });

    it("deve retornar erro quando faltarem dados", async () => {
      const result = await authService.login({ username: "user1" });
      expect(result.status).toBe(400);
      expect(result.error).toBe("username and password are required");
    });

    it("deve falhar quando usuário não existir", async () => {
      userRepo.findByUsername.mockResolvedValue(null);

      const result = await authService.login({ username: "wrong", password: "123" });

      expect(result.status).toBe(401);
      expect(result.error).toBe("Invalid credentials");
    });

    it("deve falhar quando senha estiver errada", async () => {
      userRepo.findByUsername.mockResolvedValue({ id: 1, passwordHash: "hash" });
      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.login({ username: "user1", password: "wrong" });

      expect(result.status).toBe(401);
      expect(result.error).toBe("Invalid credentials");
    });
  });

  // 8. Logout
  describe("logout", () => {
    it("deve invalidar o token com sucesso", () => {
      const result = authService.logout({ access_token: "t1" });
      expect(result.status).toBe(200);
      expect(result.data.message).toBe("User logged out successfully");
    });

    it("deve retornar erro quando access_token não for enviado", () => {
      const result = authService.logout({});
      expect(result.status).toBe(400);
      expect(result.error).toBe("access_token is required");
    });

    it("após logout, verifyToken deve bloquear o token", () => {
      authService.logout({ access_token: "t2" });

      const v = authService.verifyToken("t2");
      expect(v.error).toBe("token invalidated");
    });
  });

  // 9. Perfil
  describe("getProfileByToken", () => {
    it("deve retornar o perfil para um token válido", async () => {
      jwt.verify.mockReturnValue({ userId: 1 });
      userRepo.findById.mockResolvedValue({ username: "user1", email: "user1@test.com" });

      const result = await authService.getProfileByToken("valid_token");

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ username: "user1", email: "user1@test.com" });
    });

    it("deve retornar erro para token inválido", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("bad token");
      });

      const result = await authService.getProfileByToken("invalid_token");

      expect(result.status).toBe(401);
      expect(result.error).toBe("Invalid token");
    });

    it("deve retornar erro quando usuário não for encontrado", async () => {
      jwt.verify.mockReturnValue({ userId: 1 });
      userRepo.findById.mockResolvedValue(null);

      const result = await authService.getProfileByToken("valid_token");

      expect(result.status).toBe(404);
      expect(result.error).toBe("User not found");
    });

    it("deve retornar erro se token estiver na blacklist (logout)", async () => {
      authService.logout({ access_token: "t3" });

      const result = await authService.getProfileByToken("t3");

      expect(result.status).toBe(401);
      expect(result.error).toBe("Invalid token");
    });
  });
});
