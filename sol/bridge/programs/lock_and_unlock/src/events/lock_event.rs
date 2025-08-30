use anchor_lang::prelude::*;

#[event]
pub struct LockEvent {
    pub locker: Pubkey,
    pub amount: u64,
    pub eth_address: String,
}
