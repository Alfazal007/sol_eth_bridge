use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::DataAccount;

#[derive(Accounts)]
pub struct Lock<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = pool_authority,
        associated_token::token_program = token_program,
    )]
    pub token_account_which_locks_tokens: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub sender_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        seeds = [b"data_account789"],
        bump=data_account.bump_data_account
    )]
    pub data_account: Account<'info, DataAccount>,
    #[account(
        seeds = [b"pool_authority"],
        bump=data_account.bump_pool_authority
    )]
    pub pool_authority: SystemAccount<'info>,
}
