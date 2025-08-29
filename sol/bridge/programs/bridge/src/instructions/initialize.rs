use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::DataAccount;

#[derive(Accounts)]
pub struct InitializeMintAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        mint::decimals = 18, // to match eth token asset
        mint::authority = mint.key(),
        mint::freeze_authority = mint.key(),
        seeds = [b"mint",signer.key().as_ref()],
        bump
    )]
    pub mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        payer = signer,
        space = 8 + 1 + 1 + 32,
        seeds = [b"data_account456"],
        bump
    )]
    pub data_account: Account<'info, DataAccount>,
}
