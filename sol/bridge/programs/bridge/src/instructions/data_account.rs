use anchor_lang::prelude::*;

#[account]
pub struct DataAccount {
    pub bump_mint: u8,
    pub bump_data_account: u8,
}
