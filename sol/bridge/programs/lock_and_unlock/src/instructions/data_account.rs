use anchor_lang::prelude::*;

#[account]
pub struct DataAccount {
    pub bump_pool_authority: u8,
    pub bump_data_account: u8,
    pub owner: Pubkey,
}
