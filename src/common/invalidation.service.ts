export abstract class InvalidationService {
    public abstract onInvalidate(): Promise<void>;
}
