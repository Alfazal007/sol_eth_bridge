use anchor_lang::prelude::*;

#[event]
pub struct BurnEvent {
    pub burner: Pubkey,
    pub amount: u64,
    pub eth_address: String,
}
