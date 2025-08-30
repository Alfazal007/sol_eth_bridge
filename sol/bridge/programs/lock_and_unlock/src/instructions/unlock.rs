use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::DataAccount;

#[derive(Accounts)]
pub struct Unlock<'info> {
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
        seeds = [b"data_account789"],
        bump
    )]
    pub data_account: Account<'info, DataAccount>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = reciver_solana_account,
        associated_token::token_program = token_program,
    )]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,
    pub reciver_solana_account: SystemAccount<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    #[account(
        seeds = [b"pool_authority"],
        bump
    )]
    pub pool_authority: SystemAccount<'info>,
}
