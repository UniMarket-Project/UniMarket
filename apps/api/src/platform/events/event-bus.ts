import { EventEmitter } from 'events';
import type { DomainEventMap, DomainEventName } from './event-types.js';
import { logger } from '../logger/logger.js';

class DomainEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  public emit<K extends DomainEventName>(event: K, payload: DomainEventMap[K]): void {
    logger.debug({ event, payload }, `[EventBus] Emitted: ${event}`);
    this.emitter.emit(event, payload);
  }

  public on<K extends DomainEventName>(event: K, handler: (payload: DomainEventMap[K]) => Promise<void> | void): void {
    this.emitter.on(event, async (payload: DomainEventMap[K]) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error({ err: error, event }, `[EventBus] Handler failed for event ${event}`);
      }
    });
  }
}

export const eventBus = new DomainEventBus();
