use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::DataAccount;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = pool_authority,
        associated_token::token_program = token_program,
    )]
    pub token_account: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        payer = signer,
        space = 8 + 1 + 1 + 32,
        seeds = [b"data_account789"],
        bump
    )]
    pub data_account: Account<'info, DataAccount>,
    #[account(
        seeds = [b"pool_authority"],
        bump
    )]
    pub pool_authority: SystemAccount<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
