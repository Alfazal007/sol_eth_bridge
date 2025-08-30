use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::DataAccount;

#[derive(Accounts)]
pub struct Lock<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"token_account",data_account.owner.key().as_ref()],
        bump
    )]
    pub token_account_which_locks_tokens: InterfaceAccount<'info, TokenAccount>, // receiver account
    pub mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub sender_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        seeds = [b"data_account789"],
        bump
    )]
    pub data_account: Account<'info, DataAccount>,
}
