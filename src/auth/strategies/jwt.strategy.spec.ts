import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtStrategy],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    describe('validate', () => {
        it('should return user payload', async () => {
            const payload = {
                sub: 1,
                email: 'test@example.com',
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                id: payload.sub,
                email: payload.email,
            });
        });
    });
});